const { Model } = require("sequelize");



module.exports = (sequelize,DataTypes)=>{
    class Sensor extends Model{
        static associate(db){
            
            db.Sensor.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
        }
    }
    
    Sensor.init({
        sensor_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        device_id:{
            type:DataTypes.STRING,
            allowNull:false
        },
        user_id:{
            type:DataTypes.INTEGER,
        },
        record_date:{
            type:DataTypes.DATE
        },
        temperature:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        max_temperature:{
            type:DataTypes.FLOAT
        },
        max_temperature_at:{
            type:DataTypes.DATE
        },
        min_temperature:{
            type:DataTypes.FLOAT
        },
        min_temperature_at:{
            type:DataTypes.DATE
        },
        count:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
        },
        temp_sum:{
            type:DataTypes.DOUBLE,
            allowNull:true,
        },
        temp_avg:{
            type:DataTypes.DOUBLE,
            allowNull:true,
        }
    },{
        sequelize,
        modelName:'Sensor',
        tableName:'sensor',
        timestamps:true,
        createdAt:false,
        updatedAt:'updated_at'
    })
    
    return Sensor;

}