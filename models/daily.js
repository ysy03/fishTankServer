const { Model } = require("sequelize")


module.exports = (sequelize,DataTypes)=>{

    class Daily extends Model{
        static associate(db){
            db.Daily.belongsTo(db.Tank,{foreignKey:'device_id',sourceKey:'device_id'})
        }
    }

    Daily.init({
        daily_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        device_id:{
            type:DataTypes.STRING,
            allowNull:false,
            references:{
                model:'tank',
                key:'device_id'
            },
            onDelete:'CASCADE'
        },
        max_temperature:{
            type:DataTypes.DOUBLE,
            allowNull:false
        },
        min_temperature:{
            type:DataTypes.DOUBLE,
            allowNull:false
        },
        avg_temperature:{
            type:DataTypes.DOUBLE,
            allowNull:false
        },
        water_quality:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        daily:{
            type:DataTypes.DATE,
            allowNull:false
        }
    },{
        sequelize,
        tableName:'daily',
        modelName:'Daily',
        timestamps:false,
    })

    return Daily
}