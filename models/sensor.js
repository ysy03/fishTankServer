const { Model } = require("sequelize");



module.exports = (sequelize,DataTypes)=>{
    class Sensor extends Model{
        static associate(db){
           db.Sensor.belongsTo(db.Tank,{foreignKey:'device_id',targetKey:'device_id'})
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
            references:{
                model:'tank',
                key:'device_id'
            },
            onDelete:'CASCADE'
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
    },{
        sequelize,
        modelName:'Sensor',
        tableName:'sensor',
        timestamps:true,
        createdAt:'created_at',
        updatedAt:false
    })
    
    return Sensor;

}