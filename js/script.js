(function(){
    var cnv = document.querySelector("canvas")
    var ctx = cnv.getContext("2d")

    // recursos do jogo

    // entradas
    var LEFT = 37, RIGHT = 39, ENTER = 13, SPACE = 32

    // direções
    var mvLeft = mvRight = false

    // Estados do jogo
    var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3
    var gameState = LOADING

    // listeners
    window.addEventListener("keydown", function() {
        var key = e.keyCode

        switch(key) {
            case LEFT :
                mvLeft = true
                break
            case RIGHT :
                mvRight = true
                break
        }
    },false)
    window.addEventListener("keyup", function() {
        var key = e.keyCode

        switch(key) {
            case LEFT :
                mvLeft = false
                break
            case RIGHT :
                mvRight = false
                break
            case ENTER : 
                if(gameState !== PLAYING) {
                    gameState = PLAYING
                } else {
                    gameState = PAUSED
                }
        }
    },false)



    // Funções do jogo

    function loop() {
        requestAnimationFrame(loop, cnv)
        update()
        render()
    }

    function update() {

    }

    function render() {

    }

}())