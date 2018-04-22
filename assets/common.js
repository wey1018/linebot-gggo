module.exports.randNum = randNum

function randNum(len){
    let r = Math.round(Math.random() * (len - 1));
    // r = r % 2 === 1 ? r - 1 : r;
    return r
}