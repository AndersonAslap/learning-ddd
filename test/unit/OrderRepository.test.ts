import { randomUUID } from 'crypto'
import { Sequelize } from "sequelize-typescript"
import { Customer } from "../../src/domain/entity/Customer"
import { Product } from "../../src/domain/entity/Product"
import { CustomerRepository } from '../../src/domain/repository/CustomerRepository'
import ProductRepository from '../../src/domain/repository/ProductRepository'
import { CustomerRepositoryDatabase } from '../../src/infra/repository/CustomerRepositoryDatabase'
import { ProductRepositoryDatabase } from '../../src/infra/repository/ProductRepositoryDatabase'
import { Order } from '../../src/domain/entity/Order'
import { Item } from '../../src/domain/entity/Item'
import { ProductModel } from '../../src/infra/database/sequelize/model/ProductModel'
import { CustomerModel } from '../../src/infra/database/sequelize/model/CustomerModel'
import { OrderRepository } from '../../src/domain/repository/OrderRepository'
import { ItemModel } from '../../src/infra/database/sequelize/model/ItemModel'
import { OrderModel } from '../../src/infra/database/sequelize/model/OrderModel'
import { OrderRepositoryDatabase } from '../../src/infra/repository/OrderRepositoryDatabase'

let sequelize: Sequelize
let customer: Customer
let product1: Product
let product2: Product
let customerRepository: CustomerRepository
let productRepository: ProductRepository
let orderRepository: OrderRepository


describe("Order repository unit tests", () => {

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memoryOrderRepository',
            logging: false,
            sync: { force: true }
        })
        sequelize.addModels([ProductModel, CustomerModel, ItemModel, OrderModel])
        await sequelize.sync()

        customerRepository = new CustomerRepositoryDatabase()
        productRepository = new ProductRepositoryDatabase()
        orderRepository = new OrderRepositoryDatabase()

        customer = new Customer(randomUUID(), "Anderson Adolfo")
        product1 = new Product(randomUUID(), "Product - 1", 10)
        product2 = new Product(randomUUID(), "Product - 2", 17)

        await customerRepository.save(customer)
        await productRepository.save(product1)
        await productRepository.save(product2)
    })

    afterEach(async() => {
        await sequelize.close()
    })

    it("should create an order", async () => {
        const item = new Item(randomUUID(), product1._id, product1._price, 2)
        const order = new Order(randomUUID(), customer._id, [item])
        await orderRepository.save(order)
        const orderModel = await OrderModel.findOne({
            where: { id: order._id },
            include: ["items"],
        });
        expect(orderModel.toJSON()).toStrictEqual({
            id: order._id,
            customer_id: customer._id,
            total: order._total,
            items: [
              {
                id: item._id,
                price: item._price,
                quantity: item._quantity,
                order_id: order._id,
                product_id: product1._id,
              },
            ],
        });
    })
})