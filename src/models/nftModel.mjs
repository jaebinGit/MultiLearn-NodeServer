import db from '../config/database.mjs';

export const executeTransaction = (answerId, tokenId, metadataUrl) => {
    return new Promise((resolve, reject) => {
        db.beginTransaction(err => {
            if (err) return reject(err);

            const query = 'INSERT INTO nfts (answer_id, token_id, metadata_url) VALUES (?, ?, ?)';
            db.query(query, [answerId, tokenId, metadataUrl], (error, results) => {
                if (error) {
                    return db.rollback(() => {
                        reject(error);
                    });
                }

                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            reject(err);
                        });
                    }
                    resolve(results.insertId);
                });
            });
        });
    });
};