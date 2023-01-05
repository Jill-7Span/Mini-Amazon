const env = require("../.env")

//      sequelize import
const { Sequelize, DataTypes } = require('sequelize');

//      passing database = = db name , username , password , host  , dialect
const sequelize = new Sequelize( DB_NAME, ROOT, PASSWORD, {
    host : HOST_NAME,
    port : PORT_NUMBER,
    dialect: DIALECT,
    logging: false      // to log off in console
});

//      sequelize defining  
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//      connecting db to model
db.users = require("./usersModel")(sequelize, DataTypes);
db.product = require("./productModel")(sequelize, DataTypes);
db.cart = require("./cartModel")(sequelize, DataTypes);
db.permission = require("./permissionModel")(sequelize, DataTypes);
db.order = require("./orderModel")(sequelize, DataTypes);
db.order_product = require("./order_productModels")(sequelize, DataTypes);

//      Relationship
db.product.belongsTo(db.users, { foreignKey: 'seller_id' });
db.cart.belongsTo(db.product, { foreignKey: 'product_id' });
db.order.belongsTo(db.users, { foreignKey: 'buyer_id' });


//      sync db
// db.sequelize.sync({force:true})
db.sequelize.sync({ force: false })
    .then(() => {
        console.log("##     R E _ S Y N C      ##");
    })
    .catch((error) => {
        console.log("##     E R R O R        " + error);
    });


//      export db
module.exports = db;
