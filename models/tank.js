const { Model } = require("sequelize");



module.exports = (sequelize,DataTypes)=>{
    class Tank extends Model{
        static associate(db){
            db.Tank.hasMany(db.Sensor,{foreignKey:'device_id',targetKey:'device_id'});
            db.Tank.hasMany(db.Feederlog,{foreignKey:'device_id',targetKey:'device_id'});
            db.Tank.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
            db.Tank.hasMany(db.Waterchangelog,{foreignKey:'device_id',targetKey:'device_id'});
            db.Tank.hasMany(db.WaterQuality,{foreignKey:'device_id',soruceKey:'device_id'});
            db.Tank.hasMany(db.Alert,{foreignKey:'device_id',soruceKey:'device_id'})
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
        },
        min_temp:{
            type:DataTypes.FLOAT,
            allowNull:true
        },
        max_temp:{
            type:DataTypes.FLOAT,
            allowNull:true
        },
        normal_waterquality:{
            type:DataTypes.INTEGER,
            allowNull:true
        },
        warning_waterquality:{
            type:DataTypes.INTEGER,
            allowNull:true
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