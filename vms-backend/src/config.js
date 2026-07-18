module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'gmfdmmzn_vms',
    password: process.env.DB_PASSWORD || 'Orbit@123',
    database: process.env.DB_NAME || 'gmfdmmzn_vms',
    port: process.env.DB_PORT || 3306
  },
  databases: {
    irrigation: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'gmfdmmzn_vms',
      password: process.env.DB_PASSWORD || 'Orbit@123',
      database: process.env.DB_NAME || 'gmfdmmzn_vms',
      port: process.env.DB_PORT || 3306
    },
    agriculture: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'gmfdmmzn_vms',
      password: process.env.DB_PASSWORD || 'Orbit@123',
      database: process.env.DB_NAME || 'gmfdmmzn_vms',
      port: process.env.DB_PORT || 3306
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    expiresIn: process.env.JWT_EXPIRES || '1h'
  },
  port: process.env.PORT || 3001
};
