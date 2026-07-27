const {Waterchangelog} = require('../models');


async function waterchange() {
    const StartDate = new Date();
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    const status = Math.random() > 0.7 ? true : false;
    await Waterchangelog.create({
        device_id:'SS501',
        status,
        started_at: StartDate,
        end_at:new Date()})
        
}

module.exports = waterchange;