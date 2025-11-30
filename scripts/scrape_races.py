import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

# 마라톤 온라인 일정 페이지 URL
URL = "http://www.marathon.pe.kr/schedule/index.html"

def scrape_marathons():
    try:
        # 페이지 가져오기 (인코딩 문제 해결을 위해 headers 추가)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(URL, headers=headers)
        response.encoding = 'euc-kr' # 마라톤 온라인은 euc-kr을 사용하는 경우가 많음
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        races = []
        
        # 테이블 행 찾기 (실제 사이트 구조에 맞춰 조정 필요)
        # 보통 table 태그 내의 tr들을 순회
        rows = soup.select('table tr')
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 5: # 유효한 데이터 행인지 확인
                try:
                    date_str = cols[0].text.strip()
                    name = cols[1].text.strip()
                    location = cols[2].text.strip()
                    phone = cols[3].text.strip() # 또는 주최
                    courses = cols[4].text.strip()
                    
                    # 날짜 파싱 (예: 2025-10-26)
                    # 실제 형식에 따라 조정 필요
                    
                    race = {
                        "name": name,
                        "date": date_str,
                        "location": location,
                        "courses": courses,
                        "status": "접수중" if "접수" in name else "예정"
                    }
                    races.append(race)
                except Exception as e:
                    continue

        print(json.dumps(races, ensure_ascii=False, indent=2))
        return races

    except Exception as e:
        print(f"Error scraping: {e}")
        return []

if __name__ == "__main__":
    print("Scraping marathon data...")
    data = scrape_marathons()
    print(f"Found {len(data)} races.")
