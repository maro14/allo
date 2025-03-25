# Allo - Modern Kanban Board Application

Allo is a modern Kanban board application designed to help you organize tasks and boost productivity. Built with Next.js, React, and MongoDB.

## Features

- **Intuitive Kanban Boards**: Create and manage boards with customizable columns
- **Drag and Drop**: Easily move tasks between columns
- **Task Management**: Create, edit, and delete tasks with rich details
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Priority Levels**: Assign priority levels to tasks (low, medium, high)
- **Labels**: Categorize tasks with color-coded labels
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Drag and Drop**: react-beautiful-dnd

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database
- Clerk account for authentication

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/components` - React components
- `/src/pages` - Next.js pages and API routes
- `/src/models` - Mongoose models
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and libraries

## API Routes

- `GET /api/boards` - Get all boards for the current user
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get a specific board with columns and tasks
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board

- `POST /api/columns` - Create a new column
- `PUT /api/columns` - Update a column
- `DELETE /api/columns` - Delete a column

- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/:id/move` - Move a task between columns
- `PUT /api/tasks/reorder` - Reorder tasks within a column

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

This updated README provides a comprehensive overview of your Allo project, including its features, tech stack, setup instructions, project structure, and API routes. It gives users and contributors a clear understanding of what the application does and how to get started with it.