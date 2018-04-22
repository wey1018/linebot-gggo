const mysql = require("mysql");
const { mysqlConfig } = require("../config");
mysqlConfig.multipleStatements = true;
const conn = mysql.createConnection(mysqlConfig);

module.exports.dbsYtch = dbsYtch;
module.exports.dbiYtsub = dbiYtsub;
module.exports.getYtchSubscription = getYtchSubscription;
module.exports.dbiYtch = dbiYtch;
module.exports.dbsYtchCid = dbsYtchCid;
module.exports.dbsYtchUid = dbsYtchUid;
module.exports.getNBATop10U = getNBATop10U;
module.exports.dbdYtch = dbdYtch;

function dbsYtch() {
  return new Promise((resolve, reject) => {
    conn.query("SELECT CHANNEL_NAME_ZH FROM ytChannel ORDER BY CHANNEL_NAME_ZH", (err, results) => {
      if (err) reject(err);
      resolve(results)
    });
  });
}

function dbiYtsub(ytch_zh, userId) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ytSubscription (USER_ID, CHANNEL_ID, CHANNEL_NAME_ZH) 
                  SELECT * FROM (SELECT ? AS USER_ID, ytChannel.CHANNEL_ID, CHANNEL_NAME_ZH FROM ytChannel WHERE CHANNEL_NAME_ZH = ?) AS A
                  WHERE NOT EXISTS (SELECT ID FROM ytSubscription WHERE USER_ID = ? AND CHANNEL_NAME_ZH = ?)`;

    conn.query(query, [userId, ytch_zh, userId, ytch_zh], (err, results) => {
      if (err) reject(err);
      resolve(results)
    });
  });
}

function getYtchSubscription() {
  return new Promise((resolve, reject) => {
    const query = `SELECT USER_ID, CHANNEL_ID FROM ytSubscription;`;
    conn.query(query, (err, results) => {
      if (err) reject(err);
      let obj = {};
      results.forEach(g => {
        if(!obj[g.CHANNEL_ID]){
          obj[g.CHANNEL_ID] = [g.USER_ID]
        }else{
          obj[g.CHANNEL_ID].push(g.USER_ID)
        }
      });
      resolve(obj);
    });
  });
}

function dbiYtch(id, name, zh) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ytChannel (CHANNEL_ID, CHANNEL_NAME, CHANNEL_NAME_ZH)
                  SELECT * FROM (SELECT ? AS CHANNEL_ID, ? AS CHANNEL_NAME, ? AS CHANNEL_NAME_ZH) AS tmp
                  WHERE NOT EXISTS
                  (SELECT ID FROM ytChannel WHERE CHANNEL_ID = ? AND CHANNEL_NAME = ?);`;
    conn.query(query, [id, name, zh, id, name], (err, results) => {
      if (err) reject(err);
      results.id = id
      resolve(results);
    });
  });
}

function dbsYtchUid(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT CHANNEL_NAME_ZH FROM ytSubscription WHERE USER_ID = ?`;
    conn.query(query, [id], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}

function dbsYtchCid(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT CHANNEL_ID, CHANNEL_NAME, CHANNEL_NAME_ZH FROM ytChannel WHERE CHANNEL_ID = ?`;
    conn.query(query, [id], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}

function getNBATop10U() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT USER_ID FROM nbaTop10';
    conn.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}

function dbdYtch(name_zh) {
  return new Promise((resolve, reject) => {
    // const query = `DELETE ytSubscription, ytChannel FROM ytSubscription INNER JOIN ytChannel ON ytSubscription.CHANNEL_NAME_ZH = ytChannel.CHANNEL_NAME_ZH WHERE ytSubscription.CHANNEL_NAME_ZH = ? AND ytChannel.CHANNEL_NAME_ZH = ?`
    const query = `DELETE FROM ytChannel WHERE ytChannel.CHANNEL_NAME_ZH = ?; DELETE FROM ytSubscription WHERE ytSubscription.CHANNEL_NAME_ZH = ?;`

    conn.query(query, [name_zh, name_zh], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}