
# Live Code With Tom - Backend

This project is the backend server for the Live Code With Tom application, enabling real-time collaboration on code blocks using socket.io and REST APIs to manage sessions and users.

## Features

- **REST API** for handling user sessions and other operations.
- **Real-time communication** using `socket.io`.
- **MongoDB** as the database.
- **Environment variables** management using `dotenv`.
  
## Prerequisites

Before you begin, ensure you have installed:

- Node.js (>= 14.x)
- npm (comes with Node.js)
- MongoDB (running locally or on a server)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repository.git
   ```

2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:

   ```bash
   MONGO_URI=<your_mongo_uri>
   PORT=3000
   ```

## Running the Project

### Development Mode

To start the project in development mode:

```bash
npm run dev
```

This will compile the TypeScript code and run the server with `nodemon`.

### Production Mode

To build the project for production:

```bash
npm run build
```

After building, you can start the server:

```bash
npm start
```

## Project Structure

- `src/`: Contains the source code of the server, including controllers, models, and socket.io configuration.
- `dist/`: The compiled JavaScript files.
- `tsconfig.json`: TypeScript configuration file.

## Technologies Used

- **Express** as the web framework.
- **Socket.io** for real-time communication.
- **MongoDB** for the database.
- **TypeScript** for static type checking.

## Available Scripts

- `npm run dev`: Runs the project in development mode with `nodemon`.
- `npm run build`: Compiles the TypeScript code into JavaScript.
- `npm start`: Runs the project in production mode.
  
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
