$(function(){

  // 현재 페이지의 쿼리 문자열을 가져옴
  const queryString = window.location.search;
  // 쿼리 파라미터를 분석
  const urlParams = new URLSearchParams(queryString);
  // movieCd 값을 가져와서 변수에 저장
  const movieCd = urlParams.get('movieCd');
  console.log(movieCd);  // 👉 "20253093" 출력됨

  /** 영화정보 받아오기 */
  const KOBIS_KEY = '3b2ef121a16d8b50bc772dcb2b51e544';
  // const movieCd = "20050110"; 

  $.ajax({
    url: "https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json",
    method: "GET",
    dataType: "json",
    data: {
      key: KOBIS_KEY,
      movieCd: movieCd
    },
    success: function (response) {
      const movie = response.movieInfoResult.movieInfo;
      console.log(movie)
      
      if(movie.movieCd != null){    
          //영화제목 변경
        $('#title').text(movie.movieNm)
        $('#enTitle').text(movie.movieNmEn)

        // 장르르
        $.each(movie.genres, function(index, value){
          $('.genres').append('<span>' + this.genreNm + '</span>')
        })
        
        //감독, 개봉일, 러닝타임, 연령등급, 출연진 변경
        $.each(movie.directors, function(){
          $('.sub-info #director').text(this.peopleNm)
        });

        //개봉일
        $('.sub-info #prdDate').text(
          movie.openDt.slice(0,4) + '년 ' + movie.openDt.slice(4,6) + '월 '
          + movie.openDt.slice(6,8) + '일'
          );

        //러닝타임
        $('.sub-info #runnigTime').text(movie.showTm + '분')


        /*연령등급
        audits이 가끔 빈 배열일때가 있다. 그런 경우에 분기문*/
        if(movie.audits.length != 0){
          $('.sub-info #filmAge').text(movie.audits[0].watchGradeNm)
        }else{
          $('.sub-info #filmAge').text(' ')
        }
        

        //출연
        let acs = ''
        $.each(movie.actors.slice(0, 7), function(index, item){
          acs += item.peopleNm + " | "
          $('#actors').text(acs)
        });
        
        /* kobis로부터 받은 데이터와 tmdb로부터 받은 데이터가 잘 매핑돼야한다.
        영화제목 + 개봉일로 검색하면 꽤나 정확할 듯 하다.
        kobis에서의 개봉일은 "YYYYMMDD" 형식이고 
        TMDB에서의 개봉일은 "YYYY-DD-MM" 형식이다.*/
        let movieTitle = movie.movieNm;
        let prdYear = movie.openDt.slice(0,4)
        let movieNmOg = movie.movieNmOg
        let movieNmEn = movie.movieNmEn

        /*영화 포스터 받아오기*/
        const TMDB_KEY = '6b3ad7338aff29d77e207d5c0bad974d';  // ← 여기에 TMDB API 키를 넣으세요
        const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
        const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
        let query = movieTitle

        $.ajax({
          url: TMDB_SEARCH_URL,
          method: 'GET',
          data: {
            api_key: TMDB_KEY,
            query: query,
            language: 'ko-KR'
          },
          // TMDB로부터 데이터를 잘 받았으면
          success: function (response) {
            if(response.results.length > 0) {
              // 어떤게 진짜인가?
              let obj = 0;
              console.log(response)
              //console.log(response.results[0].original_title)
              //console.log(movieNmOg)
              if(response.results.length > 1){
                $.each(response.results, function(index, item){
                  if(((item.release_date.slice(0, 4) === prdYear)&&(item.title == movieTitle))){
                    obj = item;
                    //console.log(obj)
                  }
                })
              }else{
                obj = response.results[0]
              }

              const posterPath = obj.poster_path;
              const backDropPath = obj.backdrop_path
              const fullPosterUrl = TMDB_IMAGE_BASE + posterPath;
              const fullBackDropUrl = TMDB_IMAGE_BASE + backDropPath;
              

              $('.poster #poster').attr('src', fullPosterUrl)   // 영화포스터 
              $('#story').text(obj.overview + obj.overview + obj.overview + obj.overview + obj.overview + obj.overview + obj.overview )               //영화 줄거리

              // movie-header의 배경
              $('.movie-header .bg-overlay').css('background', `url("${fullBackDropUrl}") center / 100% 100% no-repeat`)


            } else {
              $('#poster').html('<p>검색 결과가 없습니다.</p>');
              console.log('검색결과 없음');
            }
          },
          error: function () {
            //$('#posterContainer').html('<p>요청에 실패했습니다.</p>');
            console.log('요청 실패');
          }
        });
      }else if(movie.movieCd == null){      // end if movieCd != null
        console.log('movie.movieCd is null')
      }
    },
    error: function (xhr, status, error) {
      console.log("❌ 요청 실패: " + error);
    }
  });

  /**더보기 버튼 */
  $('#toggleButton').click(function(){
    const story = $('#story');
    if(story.hasClass('collapsed')){
      story.removeClass('collapsed').addClass('expanded');
      $(this).text('접기');
    }else {
      story.removeClass('expanded').addClass('collapsed');
      $(this).text('더보기')
    }
  })

  $('#reserveBtn').click(function() {
    window.location.href = `reserve.html?movieCd=${movieCd}`;
  });
  
  /** 댓글입력 */

  // 1. 평점, 좋았던점, 코멘트, 작성자자를 담을 변수
  let score = 0;    // 평점
  let goodJob = []  // 좋았던 점
  let comment = ''  // 코멘트
  let commentWriter = ''  //작성자

  // 2. 별점 선택 처리
  $(".stars span").on("click", function (e) {
    const $this = $(this);
    const offset = $this.offset();
    const width = $this.outerWidth();
    const offsetX = e.pageX - offset.left;
    const index = $this.index();
  
    // 점수 계산
    score = offsetX < width / 2 ? index + 0.5 : index + 1;
    $("#rating").val(score); // 10점 만점으로 저장
  
    // 모든 별 초기화
    $(".stars span").removeClass("selected half");
  
    // 정수 부분까지 selected
    for (let i = 0; i < Math.floor(score); i++) {
      $(".stars span").eq(i).addClass("selected");
    }
  
    // 반쪽 별
    if (score % 1 === 0.5) {
      $(".stars span").eq(Math.floor(score)).addClass("selected half");
    }
  });

  // 3. 등록버튼 눌렀을 때
  $('#addComment').click(function(){
    //console.log(typeof $('#comment').val()) //string
    if($('#comment').val() == ''){
      alert('코멘트를 입력해주세요')
    }else{
      // 4. 작성자 저장
      commentWriter = $('#commentWriter').val()
      console.log(commentWriter)

      // 5. 좋았던 점 저장
      $('.recommend-box input:checked').each(function(index, item){
        goodJob.push($(this).val())
      })
      console.log(goodJob)

      // 6. 좋았던 점 문자열 생성
      goodJobString = ''
      $.each(goodJob, function(index, item){
        goodJobString += `<em class="tag">${item}</em> &nbsp`
      })
      console.log(goodJobString)

      // 7. 코멘트 저장
      comment = $('#comment').val()

      let lastComment = `<li>
                            <div class="comment-box">
                              <div class="user-prof">
                                <img src="https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png" alt="프로필">
                                <p class="wrtiter">${commentWriter}</p>
                              </div>
                              <div class="story-cont">
                                <div class="story-point">
                                  <strong>평점 : ${score}</strong>
                                  <div class="star-display" data-score="${score}"></div>
                                </div><br>
                                <div class="story-recommend">${goodJobString}</div>
                                <div class="story-txt">${comment}</div><br>
                                <div class="story-like">👍 추천수: 0</div>
                              </div>
                            </div>
                          </li>
                        `
      //6. 템플릿에 맞게 출력
      $('.comment-list').append(lastComment)
      
      //7. 좋았던 점, 작성자, score, 코멘트 초기화
      goodJob = []                                      //좋았던 점 
      $('#commentWriter').val('')                       // 작성자
      $(".stars span").removeClass("selected half");    // 별점
      $('#comment').val('')                             // 코멘트
      $('.recommend-box input').prop('checked', false)  // 좋았던 점 체크박스
  

      
    } //end if
  }) // end ('#addComment').click()


});
