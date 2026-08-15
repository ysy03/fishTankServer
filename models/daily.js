const { Model } = require("sequelize")


module.exports = (sequelize,DataTypes)=>{

    class Daily extends Model{
        static associate(db){
            db.Daily.belongsTo(db.Tank,{foreignkey:'device_id',sourceKey:'device_id'})
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
        temp_max:{
            type:DataTypes.DOUBLE,
            allowNull:false
        },
        temp_min:{
            type:DataTypes.DOUBLE,
            allowNull:false
        },
        temp_avg:{
            type:DataTypes.DOUBLE,
            allowNull:false
        },
        water_quality:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        created_at:{
            type:DataTypes.DATE,
            allowNull:false
        }
    },{
        sequelize,
        timestamps:false,
    })

    return Daily
}