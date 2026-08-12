const { Model } = require("sequelize")



module.exports = (sequelize,DataTypes) =>{
    class WaterQuality extends Model{
        static associate(db){
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
    },{
        sequelize,
        tableName:'waterquality',
        modelName:'WaterQuality',
        timestamps:true,
        createdAt:'created_at',
        updatedAt:false
    })
    return WaterQuality;
}