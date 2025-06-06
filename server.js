const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// In-memory data store (in production, you'd use a real database)
let tasks = [
  { id: 1, title: 'Setup Docker', description: 'Configure Docker containers', status: 'completed', priority: 'high', createdAt: new Date().toISOString() },
  { id: 2, title: 'Deploy to DigitalOcean', description: 'Deploy application to cloud server', status: 'in-progress', priority: 'high', createdAt: new Date().toISOString() },
  { id: 3, title: 'Add authentication', description: 'Implement user login and registration', status: 'pending', priority: 'medium', createdAt: new Date().toISOString() }
];
let nextId = 4;

// Routes

// Home page with dashboard
app.get('/', (req, res) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TaskFlow - Task Management (Vault-Powered)</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                background: white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            }
            .header { 
                text-align: center; 
                margin-bottom: 40px;
                color: #d63384;
            }
            .header h1 { 
                font-size: 3rem; 
                margin-bottom: 10px;
                color: #d63384;
            }
            .header p { 
                font-size: 1.2rem; 
                color: #666;
            }
            .stats { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin-bottom: 40px;
            }
            .stat-card { 
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 25px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .stat-card.completed { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
            .stat-card.progress { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
            .stat-card.pending { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }
            .stat-card h3 { font-size: 2.5rem; margin-bottom: 10px; }
            .stat-card p { font-size: 1.1rem; opacity: 0.9; }
            .api-section { 
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
            }
            .api-section h2 { 
                color: #d63384;
                margin-bottom: 20px;
                font-size: 1.8rem;
            }
            .endpoints { 
                display: grid;
                gap: 15px;
            }
            .endpoint { 
                background: white;
                padding: 20px;
                border-radius: 10px;
                border-left: 5px solid #d63384;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            .endpoint strong { color: #d63384; }
            .endpoint code { 
                background: #f1f3f4;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
            }
            .footer { 
                text-align: center;
                color: #666;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            .badge { 
                display: inline-block;
                background: #d63384;
                color: white;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 0.8rem;
                margin: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 TaskFlow <span style="font-size: 0.6em; background: #28a745; color: white; padding: 2px 8px; border-radius: 12px;">🔐 Vault</span></h1>
                <p>Modern Task Management with Docker & CI/CD - Now with GitHub Integration!</p>
                <div>
                    <span class="badge">Docker</span>
                    <span class="badge">Node.js</span>
                    <span class="badge">PostgreSQL</span>
                    <span class="badge">CI/CD</span>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>${stats.total}</h3>
                    <p>Total Tasks</p>
                </div>
                <div class="stat-card completed">
                    <h3>${stats.completed}</h3>
                    <p>Completed</p>
                </div>
                <div class="stat-card progress">
                    <h3>${stats.inProgress}</h3>
                    <p>In Progress</p>
                </div>
                <div class="stat-card pending">
                    <h3>${stats.pending}</h3>
                    <p>Pending</p>
                </div>
            </div>
            
            <div class="api-section">
                <h2>📡 API Endpoints</h2>
                <div class="endpoints">
                    <div class="endpoint">
                        <strong>GET /api/tasks</strong> - Get all tasks
                        <br><code>curl http://159.203.61.237/api/tasks</code>
                    </div>
                    <div class="endpoint">
                        <strong>POST /api/tasks</strong> - Create new task
                        <br><code>curl -X POST -H "Content-Type: application/json" -d '{"title":"New Task","description":"Task description"}' http://159.203.61.237/api/tasks</code>
                    </div>
                    <div class="endpoint">
                        <strong>PUT /api/tasks/:id</strong> - Update task
                        <br><code>curl -X PUT -H "Content-Type: application/json" -d '{"status":"completed"}' http://159.203.61.237/api/tasks/1</code>
                    </div>
                    <div class="endpoint">
                        <strong>DELETE /api/tasks/:id</strong> - Delete task
                        <br><code>curl -X DELETE http://159.203.61.237/api/tasks/1</code>
                    </div>
                    <div class="endpoint">
                        <strong>GET /health</strong> - Health check
                        <br><code>curl http://159.203.61.237/health</code>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>🐳 Deployed with Docker | ⚡ Powered by Node.js | 🚀 CI/CD with GitHub Actions</p>
                <p>Server uptime: ${Math.floor(process.uptime())} seconds | Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// API Routes
app.get('/api/tasks', (req, res) => {
  const { status, priority } = req.query;
  let filteredTasks = tasks;
  
  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  res.json({
    success: true,
    data: filteredTasks,
    total: filteredTasks.length
  });
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'medium' } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  
  const newTask = {
    id: nextId++,
    title,
    description: description || '',
    status: 'pending',
    priority,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  
  const { title, description, status, priority } = req.body;
  
  if (title) tasks[taskIndex].title = title;
  if (description !== undefined) tasks[taskIndex].description = description;
  if (status) tasks[taskIndex].status = status;
  if (priority) tasks[taskIndex].priority = priority;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  
  res.json({ success: true, data: tasks[taskIndex] });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ success: true, data: deletedTask, message: 'Task deleted successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.16-correct-reporting-test',
    memory: process.memoryUsage(),
    tasks: {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length
    }
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'TaskFlow API',
    version: '1.0.0',
    description: 'A comprehensive task management API',
    endpoints: [
      'GET /api/tasks - Get all tasks',
      'GET /api/tasks/:id - Get task by ID',
      'POST /api/tasks - Create new task',
      'PUT /api/tasks/:id - Update task',
      'DELETE /api/tasks/:id - Delete task',
      'GET /health - Health check',
      'GET /api - This documentation'
    ],
    example_usage: {
      create_task: 'POST /api/tasks with {"title": "My Task", "description": "Task details", "priority": "high"}',
      update_task: 'PUT /api/tasks/1 with {"status": "completed"}',
      filter_tasks: 'GET /api/tasks?status=completed&priority=high'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    available_routes: ['/', '/api', '/api/tasks', '/health']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;