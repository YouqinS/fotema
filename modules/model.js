const db = require('./database')
const bcrypt = require('bcrypt');

const saltRounds = 10;
let connection = null;

const LVL_NONE = 0;
const LVL_NORMAL = 1;
const LVL_MOD = 2;
const LVL_ADMIN = 3;

const USR_NOT_FOUND = 'User not found';
const EMAIL_NOT_FOUND = 'Email not found';
const PERMISSION_DENIED = 'Permission denied';

const executableAsUser = requiredlvl => f => (actorId, targetOwnerId, ...args) => {
    return getPermissions(actorId).then(lvl => {
        if (lvl >= requiredlvl(actorId, targetOwnerId)){
            return f(...args);
        } else {
            reject(PERMISSION_DENIED);
        }
    });  
}

const normalAction = executableAsUser((actor, owner) => (actor === owner) ? LVL_NORMAL : LVL_MOD);
const adminAction = executableAsUser((actor, owner) => (actor === owner) ? LVL_NORMAL : LVL_ADMIN);


const checkConnect = f => (...args) => {
    if (connection === null || connection.status === 'disconnected'){
        connection = db.connect();
    }
    return f(...args);
}

const getPermissions = (userId) => {
    return db.getDataFromAttribute(connection, 'UserInfo', 'id', userId).then(users => {
        if (users.length == 1){
            return users[0].level;
        } else {
            reject(USR_NOT_FOUND);
        }
    })
}

const getMediasByAnonRelevance = (start, limit) => {
    return db.getMediasOrderedByImpact(connection, start, limit);
}

const getMediasByUserRelevance = (start, limit, user) => {
    //TODO: Implement user specific relevance algorithm
    return db.getMediasOrderedByImpact(connection, start, limit);
}

const deleteMedia = (id) => {
    return db.deleteMedia(connection, id);
}

const uploadMedia = (data) => {
    return db.uploadMedia(connection, data, (result) => resolve(result));

}

const getUserId = (username) => {
    return new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'username', username).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0].id);
            else 
                reject(USR_NOT_FOUND);
        });
    });
}

const getUserIdFromEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.getDataFromAttribute(connection, 'UserInfo', 'email', email).then((result) => {
            if (result != null && result.length > 0)   
                resolve(result[0].id);
            else 
                reject(EMAIL_NOT_FOUND);
        });
    });
}

const hashPass(pass, salt) => {
    return bcrypt.hash(pass, salt);
}

const createUser = (username, email, pass, level, profilepicture = null) => {
    const psalt = bcrypt.genSalt(saltRounds);

    const ppass = psalt.then((salt) => {
        return bcrypt.hash(pass, salt);
    });

    return Promise.all([psalt, ppass]).then(([salt, hash]) => {
        db.createUser(connection, username, email, hash, salt, level, profilepicture);
    });
}

const getNumCommentsFromMedia = (mediaID) => {
    return db.getNumCommentsFromMedia(connection, mediaID);
}

const validUserEmailPair = (username, email) => {
    const userExists = getUserId(username).then(() => true).catch((err) => {
        if (err == USR_NOT_FOUND)
            return false;
        throw new Error(err);    
    });
    const emailExists = getUserIdFromEmail(email).then(() => true).catch((err) => {
        if (err == EMAIL_NOT_FOUND)
            return false;
        throw new Error(err);    
    });
    
    return Promise.all([userExists, emailExists]).then(([u, e]) => {return {valid: !(u || e), userTaken: u, emailTaken: e};});
}

const getCommentsFromMedia = (mediaID) => {
    return db.getCommentsFromMedia(connection, mediaID);
}

module.exports = {
    getMediasByAnonRelevance: checkConnect(getMediasByAnonRelevance),
    deleteMedia: checkConnect(deleteMedia),
    uploadMedia: checkConnect(uploadMedia),
    getUserId: checkConnect(getUserId),
    createUser: checkConnect(createUser),
    getNumCommentsFromMedia: checkConnect(getNumCommentsFromMedia),
    getMediasByUserRelevance: checkConnect(getMediasByUserRelevance),
    getUserIdFromEmail: checkConnect(getUserIdFromEmail),
    validUserEmailPair: checkConnect(validUserEmailPair),
    getCommentsFromMedia: checkConnect(getCommentsFromMedia),
    actorDeleteMedia: normalAction(deleteMedia)
    
};
