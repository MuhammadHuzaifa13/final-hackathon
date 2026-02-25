const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const db = {
    // Ensure data directory and files exist
    async init() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            const files = ['users.json', 'doctors.json', 'appointments.json', 'records.json'];
            for (const file of files) {
                const filePath = path.join(DATA_DIR, file);
                try {
                    await fs.access(filePath);
                } catch {
                    await fs.writeFile(filePath, JSON.stringify([], null, 2));
                }
            }
            console.log('JSON DB initialized successfully');
        } catch (error) {
            console.error('JSON DB initialization error:', error);
        }
    },

    // Read a collection
    async read(collection) {
        const filePath = path.join(DATA_DIR, `${collection}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    },

    // Write a collection
    async write(collection, data) {
        const filePath = path.join(DATA_DIR, `${collection}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    },

    // Find one by field
    async findOne(collection, query) {
        const data = await this.read(collection);
        return data.find(item => {
            for (const key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    },

    // Find all by field
    async find(collection, query = {}) {
        const data = await this.read(collection);
        return data.filter(item => {
            for (const key in query) {
                if (typeof query[key] === 'object' && query[key]['$in']) {
                    if (!query[key]['$in'].includes(item[key])) return false;
                } else if (item[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        });
    },

    // Create an item
    async create(collection, item) {
        const data = await this.read(collection);
        const newItem = {
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            ...item
        };
        data.push(newItem);
        await this.write(collection, data);
        return newItem;
    },

    // Update an item
    async findByIdAndUpdate(collection, id, update) {
        const data = await this.read(collection);
        const index = data.findIndex(item => item._id === id);
        if (index === -1) return null;
        data[index] = { ...data[index], ...update, updatedAt: new Date() };
        await this.write(collection, data);
        return data[index];
    },

    // Delete an item
    async findByIdAndDelete(collection, id) {
        const data = await this.read(collection);
        const index = data.findIndex(item => item._id === id);
        if (index === -1) return null;
        const deletedItem = data.splice(index, 1)[0];
        await this.write(collection, data);
        return deletedItem;
    }
};

module.exports = db;
