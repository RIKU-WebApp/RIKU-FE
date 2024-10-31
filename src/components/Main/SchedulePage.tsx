import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; //react-router-dom 라이브러리를 사용 (useNavigation 사용할 예정)

import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';

import axios from 'axios'; //axios(서버와의 통신을 위한 라이브러리) import!

function SchedulePage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    //다음 달로 이동하기 위한 nextMonth
    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    }

    //이전 달로 이동하기 위한 prevMonth
    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    }

}

export default SchedulePage;