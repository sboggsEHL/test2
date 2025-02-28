const path = require('path');
const readline = require('readline');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('DATABASE_UM:', process.env.DATABASE_UM);

const sequelize = new Sequelize(process.env.DATABASE_UM, {
    dialect: 'postgres',
    ssl: {
        rejectUnauthorized: false, // Change to true to validate the server certificate
        ca: fs.readFileSync(path.resolve(__dirname, '../certs/ca-certificate.crt')).toString(), // Adjust the path to your CA certificate
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

const generatePassword = (firstName) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = firstName.charAt(0);
    for (let i = 1; i < 15; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

(async () => {
    console.log("Hey, let's make a new team member!");

    const firstName = await askQuestion('First Name: ');
    const lastName = await askQuestion('Last Name: ');

    const username = `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`;
    const email = `${username}@elevated.loans`;
    const password = generatePassword(firstName);
    const password_hash = await bcrypt.hash(password, 10);

    console.log(`\nGenerated Information:\nUsername: ${username}\nEmail: ${email}\nPassword: ${password}\n`);

    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await User.create({ username, email, password_hash });
        console.log('New user created successfully!');
    } catch (error) {
        console.error('Error creating new user:', error.message);
    } finally {
        rl.close();
        await sequelize.close();
    }
})();