const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes)=>{
    class WaterChangeLog extends Model{
        static associate(db){
            db.Waterchangelog.belongsTo(db.Tank,{foreignKey:'device_id',targetKey:'device_id'})
        }
    }

    WaterChangeLog.init({
        waterchangelog_id:{
            primaryKey:true,
            autoIncrement:true,
            type:DataTypes.INTEGER
        },
        device_id:{
            type:DataTypes.STRING,
            references:{
                model:'tank',
                key:'device_id'
            }
        },
        status:{
            type:DataTypes.BOOLEAN
        },
        started_at:{
            type:DataTypes.DATE
        },
        ended_at:{
            type:DataTypes.DATE,
            allowNull:true
        }
    },{
        sequelize,
        timestamps:false,
        modelName:'Waterchangelog',
        tableName:'waterchangelog'
    })

    return WaterChangeLog;
}