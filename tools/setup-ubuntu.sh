# Make sure we are within the git repository
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get root of Git repository and set it as the working directory
GIT_DIR="$(git rev-parse --show-toplevel)"
cd $GIT_DIR
mkdir tmp

# Help Dialog
function printhelp {
    printf "Usage: compile.sh [OPTION]... \n"
    printf "Options:\n"
    printf "\t-h, --help\t\tShow this help dialog.\n"
    printf "\t-j, --javascript\tInstall the"
    printf " javascript environment (default, works with -p)\n"
    printf "\t-p, --python"
    printf "\t\tInstall the python environment (works with -j)\n"
    printf "\t-y, --pypy"
    printf "\t\tInstall the pypy environment (implies -p)\n"
    printf "\t-r, --production\tSetup the repository"
    printf " with the production environment\n"
    printf "\t-d, --development\tSetup the repository"
    printf " with the argonaut development environment\n"
}

# Parse arguments
usePyPy="false"
development="true"
production="false"
while [ "$1" != "" ]; do
    case $1 in
      "-h" | "--help")
        printhelp
        exit
        ;;
      "-p" | "--python")
        pyServer="true"
        ;;
      "-y" | "--pypy")
        usePyPy="true"
      "-j" | "--javascript")
        jsServer="true"
        ;;
      "-r" | "--production")
        production="true"
        development="true"
        ;;
      "-d" | "--development")
        development = "true"
        production = "false"
        ;;
      *)
        printf "argonaut-setup: unknown option (%s)\n\n" "$1"
        printhelp
        exit
        ;;
    esac
    shift
done
if [ -z "$jsServer" ]; then
    if [ -z "$pyServer" ]; then
        jsServer="true"
        pyServer="false"
    else
        jsServer="false"
    fi
fi

sudo apt-get update
# Install server libraries (python | nodejs) w/ webserver & socket.io
if [ $jsServer == "true" ]; then
    sudo apt-get -y install nodejs
    npm install express
    npm install optimist
    npm install socket.io
fi
if [ $pyServer == "true" ]; then
    if [ $usePyPy == "true" ]; then
        sudo apt-get -y install pypy
    fi
    sudo apt-get -y install python git
    pip install tornado
    git clone git://github.com/mrjoes/tornadio2.git tmp/tornadio2
    cd $GIT_DIR/tmp/tornadio2
    python setup.py install
fi

# Handle Production Environment
if [ $production ]; then
    # TODO: Optionally, setup system service?
    # TODO: Autorun?
    cd $GIT_DIR
    if [ $jsServer == "true" ]; then
        ./tools/compile.sh -c -j
    elif [ $usePyPy == "true" ]; then
        ./tools/compile.sh -c -y
    else
        ./tools/compile.sh -c -p
    fi
    rm -rf .git src docs tools
    mv build/* .
    rm -rf build
else
    cd $GIT_DIR
    if [ $jsServer == "true" ]; then
        ./tools/compile.sh -c -d -j
    elif [ $usePyPy == "true" ]; then
        ./tools/compile.sh -c -d -y
    else
        ./tools/compile.sh -c -d -p
    fi
fi

# Clean Up
rm -rf $GIT_DIR/tmp
