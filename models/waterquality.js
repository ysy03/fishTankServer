const { Model } = require("sequelize")



module.exports = (sequelize,DataTypes) =>{
    class WaterQuality extends Model{
        static associate(db){
            db.WaterQuality.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'}),
            db.WaterQuality.belongsTo(db.Tank,{foreignKey:'device_id',targetKey:'device_id'})
        }
    }

    WaterQuality.init({
        waterquality_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        user_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'user',
                key:'user_id'
            },
            onDelete:'CASCADE'
        },
        device_id:{
            type:DataTypes.STRING,
            references:{
                model:'tank',
                key:'device_id'
            },
            onDelete:'CASCADE'
        },
        water_quality:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        record_date:{
            type:DataTypes.DATEONLY,
            allowNull:true
        },
        count:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
        },
        waterquality_sum:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
        },
        waterquality_avg:{
            type:DataTypes.DOUBLE,
            allowNull:true
        }
    },{
        sequelize,
        tableName:'waterquality',
        modelName:'WaterQuality',
        timestamps:true,
        createdAt:false,
        updatedAt:'updated_at'
    })
    return WaterQuality;
}