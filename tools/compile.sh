# Make sure we are within the git repository
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get root of Git repository and set it as the working directory
GIT_DIR="$(git rev-parse --show-toplevel)"
cd $GIT_DIR

# Parse arguments
autorun="false"
debugMode="false"
while [ "$1" != "" ]; do
    case $1 in
      "-c" | "--clean")
        rm -rf build
        ;;
      "-d" | "--debug")
        debugMode="true"
        ;;
      "-p" | "--python")
        pyServer="true"
        ;;
      "-j" | "--javascript")
        jsServer="true"
        ;;
      "-R" | "--autorun")
        autorun="true"
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

# Create build directory
if [ ! -d "build" ]; then
    mkdir build
    mkdir build/js
    mkdir build/css
fi

# Migrate raw files
cp src/client-core/core.html build/client.html
cp -r src/client-core/vendor build/vendor
cp -r src/client-core/img build/img
if [ $pyServer == "true" ]; then
    cp -r src/client-core/socket.io build/socket.io
    cp src/server-core/*.py build/
fi

# Compile CSS and Javascript
java -jar tools/Closure/stylesheets.jar \
    --output-file build/css/core.css \
    src/client-core/css/*.css
if [ $debugMode == "true" ]; then
    cat src/client-core/js/*.js >> build/js/core.js
else
    java -jar tools/Closure/compiler.jar \
    --js tools/Closure/externs/jquery-1.9.js \
    --js src/client-core/js/base.js \
    --js src/client-core/js/rtc.js \
    --js_output_file build/js/core.js
fi
if [ $jsServer == "true" ]; then
    cat src/server-core/*.js >> build/server.js
fi

# Run server
if [ $autorun = "true" ]; then
    cd build
    if [ $jsServer == "true" ]; then
        node server.js
    elif [ $pyServer == "true" ]; then
        python server.py
    fi
fi
