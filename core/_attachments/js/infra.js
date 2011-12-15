var INFRA = {};

var totalWaiting = 0,
totalLoaded = 0,
totalDdocs = 0;

function update_progress() {}

function load_scripts(scripts, callback, defer) {
    var waiting = 0;

    function startLoading() {
        if (defer) return;
        waiting++;
        totalWaiting++;
    }

    function stopLoading() {
        if (!defer) {
            totalLoaded++;
        }
        return --waiting;
    }

    function _callback() {
        stopLoading();
        Object.invoke(window, 'update_progress');

        if (callback && waiting === 0) return setTimeout(callback, 13);
    }

    scripts.forEach(function(s) {
        if (typeof s === 'function') {
            startLoading();
            s(_callback);
            return;
        }
        if (typeof s === 'object') {
            s.defer || (s.defer = defer);
            if (!s.defer) {
                startLoading();
            }
            load_scripts([s.first], function() {
                load_scripts(s.then, _callback, s.defer);
            }, s.defer);
            return;
        }

        var isGoogle = s.match(/google\.com/);
        if (s.match(/\.js$/) || isGoogle) {
            var script = document.createElement('script');
            script.src = isGoogle? s: (s + '?v=' + VER);
            script.async = true;
            if (callback) {
                startLoading();
                script.addEventListener('load', _callback, false);
            }
            setTimeout(function() {
                document.body.appendChild(script);
            }, 0);
            
        } else if (s.match(/\.css$/)) {
            var link = document.createElement('link');
            link.href = s + '?v=' + VER;
            link.rel = 'stylesheet';
            link.type = 'text/css';

            $('head')[0].appendChild(link);
        }
    });
}

var BENCHMARK_ENABLED = false;
var benchmarks = {};
var benchmarksIdx = {};

function startBenchmark(id) {
    if (BENCHMARK_ENABLED) {
        benchmarks[id] = new Date().getTime();
        benchmarksIdx[id] = 1;
    }
}

function measureBenchmark(id) {
    if (BENCHMARK_ENABLED) {
        if (!(id in benchmarks))
            return;

        $.log("benchmark: [" + id + "][" + benchmarksIdx[id] + "] " + (new Date().getTime() - benchmarks[id]) + "ms");
        benchmarksIdx[id] = benchmarksIdx[id] + 1;
    }
}
