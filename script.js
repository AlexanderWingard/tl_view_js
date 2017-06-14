function render(data) {
    var result = d3.select("#result");

    var select = result
            .selectAll("tr")
            .data(data);
    var enter = select
            .enter()
            .append("tr");
    var exit = select
            .exit()
            .remove();
    var merged = select
            .merge(enter)
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
    var rows = lines.map(function(line) {
        var ts = moment(line.substring(0,19), "YYYY-MM-DD HH:mm:ss", true);
        return {"ts": ts, "cols": line.replace(/,/g, ", ").split(";")};
    });
    render(rows);
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
2017-04-20 19:58:27 UTC+0200; end`;
    handle_content(test_string);
}

init();
test();
