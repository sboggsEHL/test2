const path = require('path');
const readline = require('readline');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('DATABASE_UM:', process.env.DATABASE_UM);

const sequelize = new Sequelize(process.env.DATABASE_UM, {
    dialect: 'postgres',
    ssl: {
        require: true,
        rejectUnauthorized: false, // Set to true if you want to validate the server certificate
        ca: fs.readFileSync(path.resolve(__dirname, '../certs/ca-certificate.crt')).toString()
    }
});

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

(async () => {
    const username = await askQuestion('Username: ');
    const newPassword = await askQuestion('New Password: ');

    console.log(`New Password (before hashing): ${newPassword}`);

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    console.log(`New Password Hash: ${newPasswordHash}`);

    try {
        await sequelize.authenticate();

        const user = await User.findOne({ where: { username } });
        if (!user) {
            console.log('User not found');
            rl.close();
            await sequelize.close();
            return;
        }

        await User.update({ password_hash: newPasswordHash }, { where: { username } });
        console.log(`Password for ${username} has been reset successfully.`);
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        rl.close();
        await sequelize.close();
    }
})();