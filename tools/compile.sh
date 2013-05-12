# Make sure we are within the git repository
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get root of Git repository and set it as the working directory
GIT_DIR="$(git rev-parse --show-toplevel)"
cd $GIT_DIR

# Parse arguments
autorun="false"
usePyPy="false"
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
      "-y" | "--pypy")
        usePyPy="true"
        pyServer="true"
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
    mkdir build/argonaut
fi

# Migrate raw files
cp src/client-core/core.html build/client.html
cp -r src/client-core/vendor build/vendor
cp -r src/client-core/img build/img
if [ $jsServer == "true" ]; then
    cp src/server-core/argonaut/*.js build/argonaut
    cp src/server-core/server.js build/server.js
fi
if [ $pyServer == "true" ]; then
    cp -r src/client-core/socket.io build/socket.io
    cp src/server-core/argonaut/*.py build/argonaut
    cp src/server-core/server.py build/server.py
fi

# Compile CSS and Javascript
if [ $debugMode == "true" ]; then
    cat src/client-core/css/*.css >> build/css/core.css
    cat src/client-core/js/*.js >> build/js/core.js
else
    java -jar tools/Closure/stylesheets.jar \
        --output-file build/css/core.css \
        src/client-core/css/*.css
    cat src/client-core/js/* >> build/js/core.pretty.js
    java -jar tools/Closure/compiler.jar \
    --js tools/Closure/externs/jquery-1.9.js \
    --js build/js/core.pretty.js
    --js_output_file build/js/core.js
fi

# Run server
if [ $autorun = "true" ]; then
    cd build
    if [ $jsServer == "true" ]; then
        node server.js
    elif [ $pyServer == "true" ]; then
        if [ $usePyPy == "true" ]; then
            pypy server.py
        else
            python server.py
        fi
    fi
fi
