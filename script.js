var focus = undefined;
var data  = [];

function recalculate() {
    for(var i = 0; i < data.length; i++) {
        var prev = find_compare_ts(i);
        if(prev != undefined && data[i]["ts"].isValid()) {
            data[i]["cols"][0] = time_conversion(data[i]["ts"].diff(prev));
        }
    }
}

function find_compare_ts(index) {
    if(focus != undefined) {
        return focus;
    }
    for(var i = index-1; i >= 0; i--) {
        if(data[i]["ts"].isValid()) {
            return data[i]["ts"];
        }
    }
}

function time_conversion(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = (millisec / (1000 * 60)).toFixed(1);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (Math.abs(seconds) < 60) {
        return seconds + " s";
    } else if (Math.abs(minutes) < 60) {
        return minutes + " m";
    } else if (Math.abs(hours) < 24) {
        return hours + " h";
    } else {
        return days + " d";
    }
}

function render() {
    recalculate();
    var result = d3.select("#result");

    var select = result
            .selectAll("tr")
            .data(data);
    var enter = select
            .enter()
            .append("tr")
            .on("click", function(d) {
                if(!d["ts"].isValid() || focus == d["ts"]) {
                    focus = undefined;
                } else {
                    focus = d["ts"];
                }
                render();
            });
    var exit = select
            .exit()
            .remove();
    var merged = select
            .merge(enter)
            .classed("active", function(d) {
                return d["ts"] == focus;
            })
            .each(render_cells);
}

function render_cells(d) {
    var select = d3.select(this)
        .selectAll("td")
        .data(d["cols"]);
    var enter = select
        .enter()
        .append("td");
    var exit = select
        .exit()
        .remove();
    var merged = select
        .merge(enter)
        .text(function(d) { return d;});
}

function handle_content(str) {
    var lines = str.split("\n");
    data = lines.map(function(line) {
        var ts = moment(line.substring(0,19), "YYYY-MM-DD HH:mm:ss", true);
        return {"ts": ts, "cols": line.replace(/,/g, ", ").split(";")};
    });
    render();
}
function handle_file_drop(e) {
    e.stopPropagation();
    e.preventDefault();
    var fr = new FileReader();
    fr.onload = function(e) {
        handle_content(e.target.result);
    };
    var files = e.dataTransfer.files;
    for(var i = 0; i < files.length; i++) {
        fr.readAsText(files[i]);
    }
}

function handle_file_drag(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
}

function init() {
    var drop_zone = document.getElementById("drop_zone");
    drop_zone.addEventListener("dragover", handle_file_drag, false);
    drop_zone.addEventListener("drop", handle_file_drop, false);
}

function test() {
   var test_string = `header
2017-04-20 11:55:42 UTC+0200; start
2017-04-20 16:58:27 UTC+0200; middle
2017-04-20 19:58:27 UTC+0200; end`;
    handle_content(test_string);
}

init();
test();
