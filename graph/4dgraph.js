
function GetRange(start,end){
    return {Start:+start,End:+end};
}

function GetCoordinateGeomatry(rangeX, rangeY, rangeZ, step){
    var geometry = new THREE.Geometry();

    for(let i = step; i <= rangeX.End; i += step){
        geometry.vertices.push(new THREE.Vector3(i, rangeY.Start, 0));
        geometry.vertices.push(new THREE.Vector3(i, rangeY.End, 0));
        geometry.vertices.push(new THREE.Vector3(i, 0, rangeZ.Start));
        geometry.vertices.push(new THREE.Vector3(i, 0, rangeZ.End));
    }
    for(let i = -step; i >= rangeX.Start; i -= step){
        geometry.vertices.push(new THREE.Vector3(i, rangeY.Start, 0));
        geometry.vertices.push(new THREE.Vector3(i, rangeY.End, 0));
        geometry.vertices.push(new THREE.Vector3(i, 0, rangeZ.Start));
        geometry.vertices.push(new THREE.Vector3(i, 0, rangeZ.End));
    }
    for(let i = step; i <= rangeY.End; i += step){
        geometry.vertices.push(new THREE.Vector3(rangeX.Start, i, 0));
        geometry.vertices.push(new THREE.Vector3(rangeX.End, i, 0));
        geometry.vertices.push(new THREE.Vector3(0, i, rangeZ.Start));
        geometry.vertices.push(new THREE.Vector3(0, i, rangeZ.End));
    }
    for(let i = -step; i >= rangeY.Start; i -= step){
        geometry.vertices.push(new THREE.Vector3(rangeX.Start, i, 0));
        geometry.vertices.push(new THREE.Vector3(rangeX.End, i, 0));
        geometry.vertices.push(new THREE.Vector3(0, i, rangeZ.Start));
        geometry.vertices.push(new THREE.Vector3(0, i, rangeZ.End));
    }
    for(let i = step; i <= rangeZ.End; i += step){
        geometry.vertices.push(new THREE.Vector3(rangeX.Start, 0, i));
        geometry.vertices.push(new THREE.Vector3(rangeX.End, 0, i));
        geometry.vertices.push(new THREE.Vector3(0, rangeY.Start, i));
        geometry.vertices.push(new THREE.Vector3(0, rangeY.End, i));
    }
    for(let i = -step; i >= rangeZ.Start; i -= step){
        geometry.vertices.push(new THREE.Vector3(rangeX.Start, 0, i));
        geometry.vertices.push(new THREE.Vector3(rangeX.End, 0, i));
        geometry.vertices.push(new THREE.Vector3(0, rangeY.Start, i));
        geometry.vertices.push(new THREE.Vector3(0, rangeY.End, i));
    }
    return geometry;
}

function GetGraphGeometry(f, rangeXRe, rangeXIm, rangeYRe, rangeYIm, step){
    var geometry = new THREE.Geometry();
    var currentIndex = 0;

    rangeXRe = GetFormedRange(rangeXRe,step);
    rangeXIm = GetFormedRange(rangeXIm,step);
    rangeYRe = GetFormedRange(rangeYRe,step);
    rangeYIm = GetFormedRange(rangeYIm,step);

    var xReStepCount = GetRangeStepCount(rangeXRe);
    var xImStepCount = GetRangeStepCount(rangeXIm);
    var yReStepCount = GetRangeStepCount(rangeYRe);
    var yImStepCount = GetRangeStepCount(rangeYIm);
    
    var vertexColors = [];
    var vertices = [];

    var dict = {};
    for (let i = 0; i < xReStepCount; i++) {
        let XRe = rangeXRe.Start + i * step;
        for (let j = 0; j < xImStepCount; j++) {
            let XIm = rangeXIm.Start + j * step;
            var arg = math.complex({re: XRe, im: XIm});
            var res = f(arg);
            PushVertex(i, j, arg, res);
        }
    }

    geometry.vertices = vertices;
    geometry.colors = vertexColors;

    for (let i = 0; i < xReStepCount - 1; i++) {
        for (let j = 0; j < xImStepCount - 1; j++) {
            var aa = (i) + (j) * xReStepCount;
            var ab = (i + 1) + (j) * xReStepCount;
            var ba = (i) + (j + 1) * xReStepCount;
            var bb = (i + 1) + (j + 1) * xReStepCount;
            if(aa in dict && ab in dict && ba in dict) {
                var face = new THREE.Face3(dict[aa], dict[ab], dict[ba]);
                face.vertexColors = [vertexColors[dict[ab]],vertexColors[dict[aa]],vertexColors[dict[ba]]];
                var revface = new THREE.Face3(dict[ab], dict[aa], dict[ba]);
                revface.vertexColors = [vertexColors[dict[ab]],vertexColors[dict[aa]],vertexColors[dict[ba]]];
                geometry.faces.push(face, revface);
            }
            if(ab in dict && bb in dict && ba in dict) {
                var face = new THREE.Face3(dict[ab], dict[bb], dict[ba]);
                face.vertexColors = [vertexColors[dict[ab]],vertexColors[dict[bb]],vertexColors[dict[ba]]];
                var revface = new THREE.Face3(dict[bb], dict[ab], dict[ba]);
                revface.vertexColors = [vertexColors[dict[bb]],vertexColors[dict[ab]],vertexColors[dict[ba]]];
                geometry.faces.push(face, revface);
            }
        }
    }

    return geometry;
    //x番目,y番目のところに、X,Yの複素数座標セットを格納
    function PushVertex(iXRe, iXIm, X, Y){
        //var xReStep = (X.Re - rangeXRe.Start) / step;
        //var xImStep = (X.Im - rangeXIm.Start) / step;
        if(!IsInRange(Y.im,rangeYIm)) return;
        var xReStep = iXRe;
        var xImStep = iXIm;
        var yReStep = (Y.re - rangeYRe.Start) / step;
        var yImStep = (Y.im - rangeYIm.Start) / step;

        var id = xReStep + xImStep * xReStepCount;
        var vertex = new THREE.Vector3(X.re, X.im, Y.re);
        var colorRate = yImStep / yImStepCount / 1.2;
        var color = new THREE.Color();
        color.setHSL(colorRate, 1, 0.5);
        vertexColors[currentIndex] = color;
        vertices[currentIndex] = vertex;
        dict[id] = currentIndex;
        currentIndex++;
    }

    function IsInRange(value,range){
        return range.Start <= value && value <= range.End; 
    }
    function GetRangeStepCount(range){
        return Math.round((range.End - range.Start) / step);
    }
    function GetFormedRange(range, step){
        return {Start:(Math.round(range.Start / step) * step), End: (Math.round(range.End / step) * step)};
    }
}