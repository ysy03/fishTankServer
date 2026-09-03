const {Model} = require('sequelize')




module.exports = (sequelize,DataTypes) =>{
    class Alert extends Model{
        static associate(db){
            db.Alert.belongsTo(db.Tank,{foreignKey:'device_id',targetKey:'device_id'})
        }
    }

    Alert.init({
        alert_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        device_id:{
            type:DataTypes.STRING,
            references:{
            model:'tank',
            key:'devie_id'
            },
            allowNull:false,
            onDelete:'CASCADE'
        },
        type:{
            type:DataTypes.ENUM('temp','waterquality','feed','waterChange'),
            allowNull:false
        },
        status:{
            type:DataTypes.STRING,
            allowNull:false
        },
        detail:{
            type:DataTypes.JSON,
            allowNull:false
        }
    },{
        sequelize,
        tableName:'alert',
        modelName:'Alert',
        timestamps:true,
        createdAt:'created_at',
        updatedAt:false
    })

    return Alert
}