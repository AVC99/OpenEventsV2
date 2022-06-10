function validateDate(date){
    return !isNaN(Date.parse(date));
}

module.exports = validateDate;