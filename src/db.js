const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const Memory = require('lowdb/adapters/Memory');

const defaultSetup = {
  companyName: 'Teldigo',
  businessHours: {
    start: '09:00',
    end: '17:00',
  },
  sales: {
    message:
      'You can ask about the apartment at 375 Beale, ask “who the realtor is”, or say “main menu” to start over.',
    options: [
      {
        question: 'tell me about the apartment',
        response:
          'The apartment at 375 beale is a $500 a month: 2 bedroom 1 bath and 650 square feet. What would you like to do, you can ask “who the realtor is” or say “main menu” to start over.',
      },
      {
        question: 'who the realtor is',
        response: 'Your realtor is Jom Dundel.',
      },
    ],
  },
  support: {
    message:
      'What would you like to do, you can ask about the support hours, “who the support agent is” or say “main menu” to start over.',
    options: [
      {
        question: 'what the support hours are',
        response:
          'Our support office hours are from 9:00AM to 5:00PM Monday - Friday, and from 10:00AM to 2:00PM on Saturday and Sunday.',
      },
      {
        question: 'who the support agent is',
        response: 'Your support agent is Jom Dundel.',
      },
    ],
  },
  operator: {
    phoneNumber: '',
  },
};

const adapter =
  process.env.NODE_ENV === 'test'
    ? new Memory()
    : new FileAsync('_data/db.json');

let db;

/**
 * Returns a cached database instance of lowdb
 * @return {Promise<*>} database instance
 */
async function getDb() {
  if (db) {
    return db;
  }

  db = await low(adapter);
  db.defaults({ setup: defaultSetup }).write();
  return db;
}

/**
 * Class representing the Assistant Setup entity. It's responsible to interact
 * with the database
 */
class Setup {
  /**
   * Creates an instance of the setup
   * @param {object} data
   */
  constructor(data) {
    this.companyName = data.companyName;
    this.businessHours = data.businessHours;
    this.sales = data.sales;
    this.support = data.support;
    this.operator = data.operator;
  }

  /**
   * Turns the properties of this class instance into a plain JSON
   * @return {*} JSON object with all setup properties
   */
  toJson() {
    return {
      companyName: this.companyName,
      businessHours: this.businessHours,
      sales: this.sales,
      support: this.support,
      operator: this.operator,
    };
  }

  /**
   * Saves an entry to the database or updates it if necessary
   *
   * @return {Promise<Setup>} the current instance of this class
   * @memberof Setup
   */
  async save() {
    const db = await getDb();
    const entry = db.get(Setup.dbKey);
    await entry.assign(this.toJson()).write();
    return this;
  }

  /**
   * Lookup for the setup in the database and returns an instance of this class
   *
   * @static
   * @return {Promise<Setup>} the instance of first match
   * @memberof Setup
   */
  static async get() {
    const db = await getDb();
    const entity = db.get(Setup.dbKey).value();
    if (!entity) {
      return null;
    }
    return new Setup(entity);
  }
}

Setup.dbKey = 'setup';

module.exports = { Setup };
