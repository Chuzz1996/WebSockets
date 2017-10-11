var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    
    var id=0;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var addPolygonToCanvas = function(point){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.beginPath();
        ctx.moveTo(point[0].x,point[0].y);
        for(let i = 1; i < point.length; i++){
            ctx.lineTo(point[i].x,point[i].y);
        }ctx.closePath();
        ctx.fill();
    }

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function (frame) {
            console.log('Connected 1: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+id, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
            });
            
            console.log('Connected 2: ' + frame);
            stompClient.subscribe('/topic/newpolygon.'+id, function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                addPolygonToCanvas(theObject);
            });
        });

    };
    
    function getOffset(obj) {
          var offsetLeft = 0;
          var offsetTop = 0;
          do {
            if (!isNaN(obj.offsetLeft)) {
                offsetLeft += obj.offsetLeft;
            }
            if (!isNaN(obj.offsetTop)) {
                offsetTop += obj.offsetTop;
            }   
          } while(obj = obj.offsetParent );
          return {left: offsetLeft, top: offsetTop};
      }
    
    

    return {

        init: function() {
            var can = document.getElementById("canvas");
            if(window.PointerEvent){
                canvas.addEventListener("pointerdown",function(event){
                    var xxx = getOffset(canvas);
                    stompClient.send("/app/newpoint."+id, {}, JSON.stringify({"x":event.pageX-xxx.left,"y":event.pageY-xxx.top}));
                });
            }else{
                canvas.addEventListener("mousedown",function(event){
                    var xxx = getOffset(canvas);
                    stompClient.send("/app/newpoint."+id, {}, JSON.stringify({"x":event.clientX-xxx.left,"y":event.clientY-xxx.top}));
                });
            };
            
        },

        conect:function(){
            //websocket connection
            if(document.getElementById("campo").value>0){
                id = document.getElementById("campo").value;
                connectAndSubscribe();
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/topic/newpoint."+id, {}, JSON.stringify({"x":px,"y":py}));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();