#!/bin/bash

# ============================================================================
# Semicolon Social Media Platform - Universal Development Launcher
# ============================================================================
# Comprehensive setup script that:
# - Checks and installs Node.js and npm if missing
# - Sets up Python virtual environment
# - Installs all dependencies
# - Builds frontend and starts development servers
# - Shows real-time logs from both servers
# ============================================================================

set -e  # Exit on any error

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$SCRIPT_DIR"
readonly FRONTEND_DIR="$PROJECT_ROOT/frontend"
readonly BACKEND_DIR="$PROJECT_ROOT/backend"
readonly VENV_NAME="venv"
readonly VENV_PATH="$BACKEND_DIR/$VENV_NAME"

# Required versions
readonly MIN_NODE_VERSION="16"
readonly MIN_NPM_VERSION="7"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    echo -e "${CYAN}"
    echo "======================================================================"
    echo "  $1"
    echo "======================================================================"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# ============================================================================
# DEPENDENCY CHECKING AND INSTALLATION
# ============================================================================

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

get_node_version() {
    if check_command node; then
        node --version | sed 's/v//' | cut -d. -f1
    else
        echo "0"
    fi
}

get_npm_version() {
    if check_command npm; then
        npm --version | cut -d. -f1
    else
        echo "0"
    fi
}

install_nodejs_npm() {
    print_step "Installing Node.js and npm..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if check_command apt-get; then
            # Debian/Ubuntu
            print_info "Detected Debian/Ubuntu system"
            sudo apt-get update
            sudo apt-get install -y curl
            
            # Install NodeSource repository
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            
        elif check_command yum; then
            # RedHat/CentOS
            print_info "Detected RedHat/CentOS system"
            sudo yum update -y
            sudo yum install -y curl
            
            # Install NodeSource repository
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
            
        elif check_command pacman; then
            # Arch Linux
            print_info "Detected Arch Linux system"
            sudo pacman -Sy --noconfirm nodejs npm
            
        else
            print_error "Unsupported Linux distribution. Please install Node.js manually."
            print_info "Visit: https://nodejs.org/en/download/"
            exit 1
        fi
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_info "Detected macOS system"
        if check_command brew; then
            brew install node
        else
            print_error "Homebrew not found. Please install Node.js manually."
            print_info "Visit: https://nodejs.org/en/download/"
            exit 1
        fi
        
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        print_error "Windows detected. Please install Node.js manually."
        print_info "Download from: https://nodejs.org/en/download/"
        print_info "Or use Windows Subsystem for Linux (WSL)"
        exit 1
        
    else
        print_error "Unsupported operating system: $OSTYPE"
        print_info "Please install Node.js manually from: https://nodejs.org/en/download/"
        exit 1
    fi
}

check_nodejs_npm() {
    print_step "Checking Node.js and npm..."
    
    local node_version=$(get_node_version)
    local npm_version=$(get_npm_version)
    
    if [[ $node_version -lt $MIN_NODE_VERSION ]]; then
        print_warning "Node.js not found or version too old (found: v$node_version, required: v$MIN_NODE_VERSION+)"
        install_nodejs_npm
    else
        print_success "Node.js v$node_version found"
    fi
    
    # Check npm after Node.js installation
    npm_version=$(get_npm_version)
    if [[ $npm_version -lt $MIN_NPM_VERSION ]]; then
        print_warning "npm not found or version too old (found: v$npm_version, required: v$MIN_NPM_VERSION+)"
        print_step "Updating npm..."
        npm install -g npm@latest
    else
        print_success "npm v$npm_version found"
    fi
}

check_python() {
    print_step "Checking Python..."
    
    if check_command python3; then
        local python_version=$(python3 --version | cut -d' ' -f2 | cut -d. -f1-2)
        print_success "Python $python_version found"
        return 0
    elif check_command python; then
        local python_version=$(python --version | cut -d' ' -f2 | cut -d. -f1)
        if [[ $python_version == "3" ]]; then
            print_success "Python 3 found (via 'python' command)"
            # Create alias for the session
            alias python3=python
            return 0
        fi
    fi
    
    print_error "Python 3 not found. Please install Python 3.7+"
    print_info "Visit: https://www.python.org/downloads/"
    exit 1
}

# ============================================================================
# SETUP FUNCTIONS
# ============================================================================

setup_frontend() {
    print_header "Setting up Frontend"
    
    cd "$FRONTEND_DIR"
    
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    print_step "Installing frontend dependencies..."
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    print_step "Building frontend..."
    if npm run build; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

setup_backend() {
    print_header "Setting up Backend"
    
    cd "$BACKEND_DIR"
    
    if [[ ! -f "requirements.txt" ]]; then
        print_error "requirements.txt not found in backend directory"
        exit 1
    fi
    
    print_step "Creating Python virtual environment..."
    if python3 -m venv "$VENV_NAME"; then
        print_success "Virtual environment created"
    else
        print_error "Failed to create virtual environment"
        exit 1
    fi
    
    print_step "Activating virtual environment..."
    source "$VENV_PATH/bin/activate"
    
    print_step "Upgrading pip..."
    pip install --upgrade pip
    
    print_step "Installing backend dependencies..."
    if pip install -r requirements.txt; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
}

# ============================================================================
# SERVER STARTUP FUNCTIONS
# ============================================================================

cleanup_processes() {
    print_step "Cleaning up existing processes..."
    
    # Kill processes on common ports
    for port in 3000 5000; do
        local pids=$(lsof -ti:$port 2>/dev/null || true)
        if [[ -n "$pids" ]]; then
            print_info "Killing processes on port $port"
            kill -9 $pids 2>/dev/null || true
        fi
    done
    
    # Kill by process name
    pkill -f "vite" 2>/dev/null || true
    pkill -f "flask" 2>/dev/null || true
    pkill -f "python.*app.py" 2>/dev/null || true
    
    sleep 2
    print_success "Cleanup completed"
}

start_backend_server() {
    print_step "Starting backend server..."
    
    cd "$BACKEND_DIR"
    source "$VENV_PATH/bin/activate"
    
    # Start backend in background with logs
    python app.py > backend.log 2>&1 &
    local backend_pid=$!
    echo $backend_pid > backend.pid
    
    # Wait a moment and check if backend started
    sleep 3
    if kill -0 $backend_pid 2>/dev/null; then
        print_success "Backend server started (PID: $backend_pid)"
        print_info "Backend URL: http://localhost:5000"
    else
        print_error "Backend server failed to start"
        cat backend.log
        exit 1
    fi
}

start_frontend_server() {
    print_step "Starting frontend development server..."
    
    cd "$FRONTEND_DIR"
    
    # Start frontend in background with logs
    npm run dev > frontend.log 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > frontend.pid
    
    # Wait a moment and check if frontend started
    sleep 3
    if kill -0 $frontend_pid 2>/dev/null; then
        print_success "Frontend server started (PID: $frontend_pid)"
        print_info "Frontend URL: http://localhost:3000"
    else
        print_error "Frontend server failed to start"
        cat frontend.log
        exit 1
    fi
}

# ============================================================================
# MONITORING FUNCTIONS
# ============================================================================

show_logs() {
    print_header "Real-time Server Logs"
    print_info "Press Ctrl+C to stop all servers"
    echo ""
    
    # Function to clean up on exit
    cleanup_on_exit() {
        print_header "Shutting down servers..."
        
        # Kill backend
        if [[ -f "$BACKEND_DIR/backend.pid" ]]; then
            local backend_pid=$(cat "$BACKEND_DIR/backend.pid")
            if kill -0 $backend_pid 2>/dev/null; then
                kill $backend_pid
                print_success "Backend server stopped"
            fi
            rm -f "$BACKEND_DIR/backend.pid"
        fi
        
        # Kill frontend
        if [[ -f "$FRONTEND_DIR/frontend.pid" ]]; then
            local frontend_pid=$(cat "$FRONTEND_DIR/frontend.pid")
            if kill -0 $frontend_pid 2>/dev/null; then
                kill $frontend_pid
                print_success "Frontend server stopped"
            fi
            rm -f "$FRONTEND_DIR/frontend.pid"
        fi
        
        # Final cleanup
        cleanup_processes
        
        print_success "All servers stopped successfully"
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup_on_exit SIGINT SIGTERM
    
    # Show real-time logs from both servers
    (
        while true; do
            if [[ -f "$BACKEND_DIR/backend.log" ]]; then
                echo -e "${BLUE}[BACKEND]${NC} $(tail -n 1 "$BACKEND_DIR/backend.log" 2>/dev/null | head -n 1)"
            fi
            if [[ -f "$FRONTEND_DIR/frontend.log" ]]; then
                echo -e "${GREEN}[FRONTEND]${NC} $(tail -n 1 "$FRONTEND_DIR/frontend.log" 2>/dev/null | head -n 1)"
            fi
            sleep 1
        done
    ) &
    
    # Keep the script running
    wait
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    print_header "Semicolon Social Media Platform - Development Launcher"
    print_info "Starting comprehensive setup and launch sequence..."
    echo ""
    
    # Check directories
    if [[ ! -d "$FRONTEND_DIR" ]]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    if [[ ! -d "$BACKEND_DIR" ]]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    # System checks and installations
    check_nodejs_npm
    check_python
    
    # Cleanup any existing processes
    cleanup_processes
    
    # Setup both frontend and backend
    setup_frontend
    setup_backend
    
    # Start servers
    start_backend_server
    start_frontend_server
    
    # Show status
    print_header "🚀 Application Successfully Started!"
    echo -e "${GREEN}✅ Backend API: ${WHITE}http://localhost:5000${NC}"
    echo -e "${GREEN}✅ Frontend App: ${WHITE}http://localhost:3000${NC}"
    echo -e "${PURPLE}✅ Virtual Environment: ${WHITE}$VENV_PATH${NC}"
    echo ""
    print_info "Both servers are running and ready for development!"
    echo ""
    
    # Show logs
    show_logs
}

# Run main function
main "$@"
