const { Model } = require("sequelize");



module.exports = (sequelize,DataTypes)=>{
    class Tank extends Model{
        static associate(db){
            db.Tank.hasMany(db.Sensor,{foreignKey:'device_id',targetKey:'device_id'});
            db.Tank.hasMany(db.Feederlog,{foreignKey:'device_id',targetKey:'device_id'});
            db.Tank.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
        }
    }

    Tank.init({
        tank_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        user_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'user',
                key:'user_id'
            }
        },
        tank_name:{
            type:DataTypes.STRING
        },
        device_id:{
            type:DataTypes.STRING
        }
        
    },{
        sequelize,
        modelName:'Tank',
        tableName:'tank',
        createdAt:'created_at',
        updatedAt:false
    })

    return Tank;
}