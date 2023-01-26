<template>
  <div class="container">
    <h3>  VS {{sendToName}} </h3>
    <button v-on:click="backtolist"> << 뒤로 </button> <button v-on:click="finishGame">게임종료</button>
    <div class="board">
      <div class="board__row" v-for="_ in 15">
        <div class="board__col"" v-for="_ in 15">
           <div class="col__grid"></div>
        </div>
      </div>
    
    </div>
      <div class="currentTurn"></div>
   
   
  </div>
</template>


<script>
import Message from "@/components/Message.vue";
import router from "@/router";
import { msgBox, sendMsg } from "@/ws/sendMsg.js";
import { friendsList } from "@/ws/addFriend.js";
import EventBus from "@/event-bus";

export default {
  name: "Chat",
  props: ["sendToId", "sendToName"],
  data: function() {
    return {
      msg: msgBox,
      inputMsg: "",
      rowEls : null,
      line : 15,
    // - 게임판(오목판) 설정
    board : [
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
      new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", "")
    ],
    // - 현재 플레이어
    player : "●"
    };
  },
  methods: {
    backtolist() {
      router.push("/main/Omok");
    },
    finishGame(){
      swal({
            icon: "success",
            title: "게임을 삭제하시겠습니까?",
            buttons: ["취소","확인"]
          }).then(value => {
            // 버튼을 클릭했을때 새로 고쳐서 다시 시작상태로 만든다.
            if(value === true){
              localStorage.removeItem(this.sendToId)
              sendMsg(this.sendToId, "[omokFinish]")
              router.push("/main/Omok");
            }
          });
    },
    send() {
      sendMsg(this.sendToId, this.inputMsg);
      this.inputMsg = "";
    },
    draw() {
      // 오목판의 배열을 순회한다.
      this.board.forEach((rowArr, rowIndex) => {
        const rowEl = this.rowEls[rowIndex];
        const colEls = rowEl.querySelectorAll(".col__grid");
        // 각각의 가로줄을 돌면서 세로열의 요소와 인덱스를 확인
        rowArr.forEach((col, colIndex) => {
          // 만약 col이 "●"일때 클래스에 black이라는 클래스를 더한다
          if (col == "●") {
            colEls[colIndex].classList.add("black");
            // 만약 col이 "○"일때 클래스에 white이라는 클래스를 더한다
          } else if (col == "○") {
            colEls[colIndex].classList.add("white");
          }
        });
      });
    
      // 승자 판별 로직 실행
      const winner = this.checkWinner();
      // 승자가 있을경우
      if (winner) {
        // 흑돌이 이겼을때,
        if (winner == "●") {
          // 턴수를 알려주는 창에서는 game over라는 텍스트를 나타낸다.
          document.querySelector(".currentTurn").textContent = "Game Over";
         swal({
            icon: "success",
            title: "축하드립니다! 흑돌(" + winner + ")의 승리입니다",
            button: "다시하기"
          }).then(value => {
            // 버튼을 클릭했을때 새로 고쳐서 다시 시작상태로 만든다.
            localStorage.removeItem(this.sendToId)
            router.push("/main/Omok");
          });
        // 백돌이 이겼을 때
        } else if (winner == "○") {
          // 턴수를 알려주는 창에서는 game over라는 텍스트를 나타낸다.
          document.querySelector(".currentTurn").textContent = "Game Over";
         swal({
            icon: "success",
            title: "패배! 백돌(" + winner + ")의 승리입니다",
            button: "다시하기"
          }).then(value => {
            // 버튼을 클릭했을때 새로 고쳐서 다시 시작상태로 만든다.
            localStorage.removeItem(this.sendToId)
            router.push("/main/Omok");
          });
        }
        // 버튼을 클릭하지 않을 경우에
        /*
        setTimeout(function () {
          // 10초동안 기다렸다가 새로 고쳐서 다시 시작상태로 만든다.
          window.location.reload();
        }, 10000);
        */
      }
    },
    turn({row,col}) {
      // 만약 바둑판에 돌이 있을 경우 못두게 경고를 띄우고
      if (this.board[row][col] != "") {
        swal({
          icon: "error",
          title: "돌 위에 돌을 둘 수 없습니다.",
          button: "다시두기"
        });
        return;
      } else {
        // 돌이 없을 경우 현재 플레이어에 대한 표시를 게임판의 해당 위치에 넣어주고
        // this.board[row][col] = this.player;
      }

      // 현재 차레가 누군인지 알려주기 위한 로직
      document.querySelector(".currentTurn").textContent =
        "Your Stone : " + this.player;
      //
      

      var tmpJson = {'board' : this.board, 'myTurn' : 'False'}

      var tmplocalStorage = localStorage.getItem(this.sendToId)
      if(tmplocalStorage != null){
          // console.log(JSON.parse(tmplocalStorage))
          var tmpls = JSON.parse(tmplocalStorage)
          tmpJson['board'] = tmpls['board']
          tmpJson['myTurn'] = tmpls['myTurn']
          if(tmpJson['myTurn'] == 'False'){
            swal({
              icon: "error",
              title: "당신 차례가 아닙니다.",
              button: "확인"
            })
            return
          }
      }

      this.board[row][col] = tmpJson['board'][row][col] = "●"
      tmpJson['myTurn'] = 'False'
      
      localStorage.setItem(this.sendToId,JSON.stringify(tmpJson))
      let msg = "[omok]"+row+":"+col
      sendMsg(this.sendToId, msg);
    },
    checkWinner() {
        for (let c = 2; c < this.line - 2; c++) {
          for (let r = 0; r < this.line; r++) {
            if (
              // 흑돌이 가로가 5개일 때 숭리
              this.board[r][c - 2] == "●" &&
              this.board[r][c - 1] == "●" &&
              this.board[r][c] == "●" &&
              this.board[r][c + 1] == "●" &&
              this.board[r][c + 2] == "●"
            ) {
              return this.board[r][c];
              break;
            } else if (
              // 흑돌이 세로가 5개일 때 숭리
              this.board[c - 2][r] == "●" &&
              this.board[c - 1][r] == "●" &&
              this.board[c][r] == "●" &&
              this.board[c + 1][r] == "●" &&
              this.board[c + 2][r] == "●"
            ) {
              return this.board[c][r];
              break;
            }
          }
        }
    
        for (let c = 2; c < this.line - 2; c++) {
          for (let r = 2; r < this.line - 2; r++) {
            if (
              // 흑돌이 대각선 좌->우 5개일 때 숭리
              this.board[r - 2][c - 2] == "●" &&
              this.board[r - 1][c - 1] == "●" &&
              this.board[r][c] == "●" &&
              this.board[r + 1][c + 1] == "●" &&
              this.board[r + 2][c + 2] == "●"
            ) {
              return this.board[r][c];
              break;
            }
            if (
              // 흑돌이 대각선 우->좌 5개일 때 숭리
              this.board[r + 2][c - 2] == "●" &&
              this.board[r + 1][c - 1] == "●" &&
              this.board[r][c] == "●" &&
              this.board[r - 1][c + 1] == "●" &&
              this.board[r - 2][c + 2] == "●"
            ) {
              return this.board[r][c];
              break;
            }
          }
        }
    
        for (let c = 2; c < this.line - 2; c++) {
          for (let r = 0; r < this.line; r++) {
            if (
              // 백돌이 가로가 5개일 때 승리
              this.board[r][c - 2] == "○" &&
              this.board[r][c - 1] == "○" &&
              this.board[r][c] == "○" &&
              this.board[r][c + 1] == "○" &&
              this.board[r][c + 2] == "○"
            ) {
              return this.board[r][c];
              break;
            }
            if (
              // 백돌이 세로가 5개일 때 승리
              this.board[c - 2][r] == "○" &&
              this.board[c - 1][r] == "○" &&
              this.board[c][r] == "○" &&
              this.board[c + 1][r] == "○" &&
              this.board[c + 2][r] == "○"
            ) {
              return this.board[c][r];
              break;
            }
          }
        }
    
        for (let c = 2; c < this.line - 2; c++) {
          for (let r = 2; r < this.line - 2; r++) {
            if (
              // 백돌이 대각선 좌->우 5개일 때 승리
              this.board[r - 2][c - 2] == "○" &&
              this.board[r - 1][c - 1] == "○" &&
              this.board[r][c] == "○" &&
              this.board[r + 1][c + 1] == "○" &&
              this.board[r + 2][c + 2] == "○"
            ) {
              return this.board[r][c];
              break;
            }
            if (
              // 백돌이 대각선 우->좌 5개일 때 승리
              this.board[r + 2][c - 2] == "○" &&
              this.board[r + 1][c - 1] == "○" &&
              this.board[r][c] == "○" &&
              this.board[r - 1][c + 1] == "○" &&
              this.board[r - 2][c + 2] == "○"
            ) {
              return this.board[r][c];
              break;
            }
          }
        }
      },
    clicked(e){
      
    }
  },
  components: {
    Message
  },
  watch:{
    msg: function(val){
      console.log("watch "+val)

    }
  },
  mounted(){
    console.log("mounted")
     // window.addEventListener('click', this.clicked) 
      this.rowEls = document.querySelectorAll(".board__row")
      this.rowEls.forEach((rowEl, rowIndex) => {
        const colEls = rowEl.querySelectorAll(".board__col")
        colEls.forEach((colEls, colIndex) => {
          // 각각의 col(오목판의 빈칸)을 클릭할 경우 이벤트 발생
          colEls.addEventListener("click", e => {
            console.log(e)
            this.turn({
              // 이때 인자로 row는 rowIndex를 col은 colIndex를 넘긴다.
              row: rowIndex,
              col: colIndex
            });
            // 화면을 그려낼 draw라는 메소드 사용
            this.draw();
          });
        });
      });
    var tmplocalStorage = localStorage.getItem(this.sendToId)
    if(tmplocalStorage != null){
        // console.log(JSON.parse(tmplocalStorage))
        var tmpBoard = JSON.parse(tmplocalStorage)
        this.board = tmpBoard['board']
        
    }
    this.draw()
  },
  updated(){
    console.log("updated")
    console.log(this.msg)
  },
  created: function() {
    console.log('created')
    if (undefined == this.msg[this.sendToId] ||null == this.msg[this.sendToId]) {
      this.$set(this.msg, this.sendToId, []); // 없을 경우, 응답 메시지가 채팅창에 업데이트 되지 않음
    }
    EventBus.$on("omok", (val) => {
     // console.log( (val.msg.split('[omok]')[1]).split(':'))
     // let temp = (val.msg.split('[omok]')[1]).split(':')
     // let row = temp[0]
     // let col = temp[1]
     // this.board[row][col] = "○" 

     if(val == "finish"){
       swal({
            icon: "success",
            title: "상대방이 게임을 종료하였습니다.",
            button: "확인"
          }).then(value => {
            if(value === true){
              router.push("/main/Omok");
            }
          });
     }else if(val == "collision"){
        localStorage.removeItem(this.sendToId)
        sendMsg(this.sendToId, "[omokFinish]")
        router.push("/main/Omok");
     }

      var tmpJson = {'board' : this.board, 'myTurn' : 'False'}
      var tmplocalStorage = localStorage.getItem(this.sendToId)
      if(tmplocalStorage != null){
          // console.log(JSON.parse(tmplocalStorage))
          var tmpBoard = JSON.parse(tmplocalStorage)
          this.board = tmpBoard['board']
         
      }
      this.draw()
    });
   
    
    
  },
  beforeDestroy: function() {
    //清除消息提示count
    var user = friendsList.list.find(v => {
      return v.userId === this.sendToId;
    });
    user.infoCount = 0;
    console.log("Destroy");

      this.rowEls = document.querySelectorAll(".board__row")
      this.rowEls.forEach((rowEl, rowIndex) => {
        const colEls = rowEl.querySelectorAll(".board__col")
        colEls.forEach((colEls, colIndex) => {
          // 각각의 col(오목판의 빈칸)을 클릭할 경우 이벤트 발생
          colEls.removeEventListener("click", e => {
            console.log(e)
          });
        });
      });
/*
    const scripts = [
     "/omoklogic.js",
    ];
    let el = document.querySelector("script[src='" + scripts + "']");
    if(el){ el.remove(); }
  */  
  },

  beforeRouteUpdate(to, from, next) {

    //防止没有添加
    if (undefined == this.msg[this.sendToId] ||null == this.msg[this.sendToId]) {
      this.$set(this.msg, this.sendToId, []);
    }
    
    //清除消息提示count
    var user = friendsList.list.find(v => {
      return v.userId === this.sendToId;
    });
    user.infoCount = 0;
    next()
  }
};
</script>

<style lang="scss" scoped>



.container {
    position: relative;
    height: 400vh;
    background-image: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
}

// 모든 div를 block으로 지정
//div {
//    display: block;
//}


// nav와 board를 떨어뜨려놓을 장치
//.empty {
//    height: 3vh;f
//}

// 오목판
.board {
    width: 400px;
  
    margin: 10px 1px 1px 1px;
    border: 1px solid black;
    box-shadow: 1px 1px 1px black;
    &__row {
        display: flex;
    }
    &__col {
        $col-width: 30px;
        width: $col-width;
        height: $col-width;
        background: #ffc078;
        position: relative;
        flex-grow: 1;
        cursor: pointer;
        font-size: 30px;
        text-align: center; // border: 1px solid black;
    }
    &__col:hover {
        background: #fd7e14;
    }
}

// 바둑알
.black::after {
    width: 25px;
    height: 25px;
    position: absolute;
    background-color: black;
    border-radius: 50%
}

.white::after {
    width: 25px;
    height: 25px;
    background-color: white;
    position: absolute;
    border-radius: 50%;
    z-index: 7;
}

// 현재 차례가 누구인지 알려주는 화면의 CSS
.currentTurn {
    text-align: center;
    font-family: 'Hanna';
    font-size: 10px;
}

// 만든사람 적어놓을 푸터 css
.footer {
    margin-top: 50px;
    height: 20vh;
    background-color: transparent;
    text-align: center;
    font-size: 25px;
}

// alert customizing
.swal-title {
    font-family: 'Hanna';
    margin: 0px;
    font-size: 30px;
    margin-bottom: 28px;
}

.swal-button {
    padding: 1px 1px;
    border-radius: 2px;
    background-image: linear-gradient(to top, #dad4ec 0%, #dad4ec 1%, #f3e7e9 100%);
    font-size: 15px;
    border: 1px solid transparent;
    color: #5f5f5f;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

// 바둑판 선 CSS
.col__grid {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.col__grid::after {
    display: block;
    content: '';
    position: absolute;
    top: 0;
    right: calc(50% - 1px);
    bottom: calc(50% - 1px);
    left: 0;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
    box-sizing: border-box;
}

.col__grid::before {
    display: block;
    content: '';
    position: absolute;
    top: calc(50%);
    right: -1px;
    bottom: -1px;
    left: calc(50%);
    border-top: 1px solid black;
    border-left: 1px solid black;
    box-sizing: border-box;
}

.board__row:first-child .col__grid::after {
    //::after :가상선택자
    border-top: none;
    border-left: none;
    border-right: none;
}

.board__row:last-child .col__grid::before {
    //::before:가상선택자
    border-bottom: none;
    border-left: none;
    border-right: none;
}

.board__col:first-child .col__grid::after {
    border-top: none;
    border-left: none;
    border-bottom: none;
}

.board__col:last-child .col__grid::before {
    border-top: none;
    border-bottom: none;
    border-right: none;
}
</style>