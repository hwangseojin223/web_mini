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
        $.each(movie.genres, function(index, value){
          $('.genres').html('<span>' + this.genreNm + '</span>')
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
        console.log('movie.audit.length : ' + movie.audits.length)

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
          acs += item.peopleNm + " "
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
                  if(((item.release_date.slice(0, 4) === prdYear)&&(item.title == movieTitle)) || (item.title == movieTitle)){
                    obj = item;
                    console.log(obj)
                  }
                })
              }else{
                obj = response.results[0]
              }

              

              const posterPath = obj.poster_path;
              const fullPosterUrl = TMDB_IMAGE_BASE + posterPath;
              $('.poster #poster').attr('src', fullPosterUrl)
              $('#story').text(obj.overview)
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
});
