(function(){
    var cnv = document.querySelector("canvas")
    var ctx = cnv.getContext("2d")

    // recursos do jogo

    // arrays
    var sprites = []
    var assetsToLoad = []
    var missiles = []
    var aliens = []
    var messages = []


    // variaveis uteis
    var alienFrequency = 100
    var alienTimer = 0
    var shoots = 0
    var hits = 0
    var accuracy = 0
    var scoreToWin = 70

    // sprites

    // cenario
    var background = new Sprite(0,56,400,500,0,0)
    sprites.push(background)

    // nave
    var defender = new Sprite(0,0,30,50,185,450)
    sprites.push(defender)

    // mensagem da tela inicial
    var startMessage = new ObjectMessage(cnv.height/2, "PRESS ENTER", "#f00")
    messages.push(startMessage)

    // mensagem de pausa
    var pausedMessage = new ObjectMessage(cnv.height/2, "PAUSED", "#f00")
    pausedMessage.visible = false
    messages.push(pausedMessage)

    // placar
    var scoreMessage = new ObjectMessage(10, "", "#0f0")
    scoreMessage.font = "normal bold 15px emulogic"
    updateScore()
    messages.push(scoreMessage)

    // imagem
    var img = new Image()
    img.addEventListener("load", loadHandler, false)
    img.src = "img/img.png"

    assetsToLoad.push(img)

    // contador de recursos
    var loadedAssets = 0

    // entradas
    var LEFT = 37, RIGHT = 39, ENTER = 13, SPACE = 32

    // ações
    var mvLeft = mvRight = shoot = spaceIsDown = false

    // Estados do jogo
    var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3
    var gameState = LOADING

    // listeners
    window.addEventListener("keydown", function(e) {
        var key = e.keyCode

        switch(key) {
            case LEFT :
                mvLeft = true
                break
            case RIGHT :
                mvRight = true
                break
            case SPACE :
                if(!spaceIsDown) {
                    shoot = true
                    spaceIsDown = true
                }
                break
        }
    },false)
    window.addEventListener("keyup", function(e) {
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
                    startMessage.visible = false
                    pausedMessage.visible = false
                } else {
                    gameState = PAUSED
                    pausedMessage.visible = true
                }
                break
                case SPACE :
                    if(spaceIsDown) {
                        spaceIsDown = false
                    }
                    break
        }
    },false)



    // Funções do jogo

    function loadHandler() {
        loadedAssets++

        if(loadedAssets === assetsToLoad.length) {
            img.removeEventListener("load", loadHandler, false)

            // inicia o jogo
            gameState = PAUSED
        }
    }

    function fireMissile() {
        var missile = new Sprite(136, 12, 8, 13, defender.centerX() - 4, defender.y - 13)
        missile.vy = -8
        sprites.push(missile)
        missiles.push(missile)
        shoots++
    }

    // remove os objetos do jogo
    function removeObjects(objectToRemove, array) {
        var i = array.indexOf(objectToRemove)
        if(i !== -1) {
            array.splice(i, 1)
        }
    }

    function updateScore() {
        
        // calculo do aproveitamento
        if(shoots == 0) {
            accuracy = 100
        } else {
            accuracy = Math.floor((hits/shoots) * 100)
        }
        // ajuste no texto de aproveitamento
        if(accuracy < 100) {
            accuracy = accuracy.toString()
            if(accuracy.length < 2) {
                accuracy = "  " + accuracy
            } else {
                accuracy = " " + accuracy
            }
        }

        // ajuste no texto do hits
        hits = hits.toString()
        if(hits.length < 2) {
            hits = "0" + hits
        }
        
        scoreMessage.text = "HITS: " + hits + " - ACCURACY: " + accuracy + "%"

    }

    function makeAlien() {

        // cria um valor aleatorio entre 0 e 7 => largura do canvas / largura do alien
        // divide o canvas em 8 colunas para o posicionamento aleatório do alien
        var alienPosition = (Math.floor(Math.random() * 8)) * 50
        var alien = new Alien(30,0,50,50, alienPosition, -50)
        alien.vy = 1

        // otimização do alien
        if(Math.floor(Math.random() * 11) > 7) {
            alien.state = alien.CRAZY
            alien.vx = 2
        }

        if(Math.floor(Math.random() * 11) > 5) {
            alien.vy = 2
        }

        sprites.push(alien)
        aliens.push(alien)
    }

    function destroyAlien(alien) {
        alien.state = alien.EXPLODED
        alien.explode()
        setTimeout(function(){
            removeObjects(alien, aliens)
            removeObjects(alien, sprites)
        }, 1000)
    }

    function loop() {
        requestAnimationFrame(loop, cnv)

        switch(gameState) {
            case LOADING :
                console.log("Loading...")
                break
            case PLAYING :
                update()
                break
        }

        render()
    }

    function update() {

        // move para a esquerda
        if(mvLeft && !mvRight) {
            defender.vx = -5
        }
        // move para a direita
        if(mvRight && !mvLeft) {
            defender.vx = 5
        }
        // para a nave
        if(!mvLeft && !mvRight) {
            defender.vx = 0
        }

        // dispara o canhão
        if(shoot) {
            fireMissile()
            shoot = false
        }

        // atualiza a posição
        defender.x = Math.max(0, Math.min(cnv.width-defender.width, defender.x + defender.vx))

        // atualiza a posição dos misseis
        for(var i in missiles) {
            var missile = missiles[i]
            missile.y += missile.vy

            if(missile.y < -missile.height) {
                removeObjects(missile, missiles)
                removeObjects(missile, sprites)
                updateScore()
                i--
            }
        }

        // incremento do alienTimer
        alienTimer++

        // criação do alien caso o timer se iguale a frequencia
        if(alienTimer === alienFrequency) {
            makeAlien()
            alienTimer = 0

            // ajuste na frequencia de criação de aliens
            if(alienFrequency > 2) {
                alienFrequency--
            }
        }

        // move os aliens
        for(var i in aliens) {
            var alien = aliens[i]
            if(alien.state !== alien.EXPLODED) {
                alien.y += alien.vy
                if(alien.state === alien.CRAZY) {
                    if(alien.x > cnv.width - alien.width || alien.x < 0) {
                        alien.vx *= -1
                    }
                    alien.x += alien.vx
                }
            }
            // Confere se algum alien chegou a Terra
            if(alien.y > cnv.height + alien.height) {
                gameState = OVER
            }

            // Confere se algum alien foi destruido
            for(var j in missiles) {
                var missile = missiles[j]
                if(collide(missile, alien) && alien.state !== alien.EXPLODED) {
                    destroyAlien(alien)
                    hits++
                    updateScore()
                    removeObjects(missile, missiles)
                    removeObjects(missile, sprites)
                    j--
                    i--
                }
            }
        }
    }

    function render() {
        ctx.clearRect(0,0,cnv.width,cnv.height)
        // exibe os sprites
        if(sprites.length !== 0) {
            for(var i in sprites) {
                var spr = sprites[i]
                ctx.drawImage(img, spr.sourceX, spr.sourceY, spr.width, spr.height, Math.floor(spr.x), Math.floor(spr.y), spr.width, spr.height)
            }
        }
        // exibe os textos
        if(messages.length !== 0) {
            for(var i in messages) {
                var message = messages[i]
                if(message.visible) {
                    ctx.font = message.font
                    ctx.fillStyle = message.color
                    ctx.textBaseline = message.baseline
                    message.x = (cnv.width - ctx.measureText(message.text).width) / 2
                    ctx.fillText(message.text, message.x, message.y)
                }
            }
        }
    }

    loop()
}())