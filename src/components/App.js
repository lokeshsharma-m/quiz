import Header from './Header'
import Main from './Main'
import Loading from './Loader'
import Error from './Error'

import { useEffect, useReducer } from 'react';
import StartScreen from './StartScreen';
import Question from './Question';
import NextButton from './NextButton';
import Progress from './Progress';
import FinishScreen from './FinishScreen';
import Footer from './Footer';
import Timer from './Timer';

const SEC_PER_QUESTION = 30;
const initialState = {
    questions: [],

    //ready,Loading,error
    status: "loading",
    index: 0,
    answer: null,
    points: 0,
    highScore: 0,
    seconds: null
}

function reducer(state, action) {

    switch (action.type) {
        case "dataRecieved":
            return {
                ...state
                , questions: action.payload,
                status: "ready",
            };
        case "dataFailed":
            return {
                ...state, staus: "error",
            }
        case "start":
            return {
                ...state, status: "active", seconds: state.questions.length * SEC_PER_QUESTION,
            }
        case "newAnswer":
            const question = state.questions.at(state.index);
            return {
                ...state, answer: action.payload,
                points: action.payload === question.correctOption ? state.points + question.points : state.points
            }
        case "nextQuestion":
            return {
                ...state, index: state.index + 1, answer: null
            }
        case "finish":
            return {
                ...state, status: "finished", highScore: state.points > state.highScore ? state.points : state.highScore,
            }
        case "restart":
            return {
                ...initialState, questions: state.questions,
                status: "ready",
            }
        case "tick":
            return {
                ...state, seconds: state.seconds - 1, status: state.seconds === 0 ? "finished" : state.status
            }
        default:
            throw new Error("Action Unknown");
    }
}

function App() {

    const [{ questions, status, index, answer, points, highScore, seconds }, dispatch] = useReducer(reducer, initialState);

    const numQuestions = questions.length;

    const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0);


    useEffect(function () {

        fetch("http://localhost:8000/questions").then(res => res.json())
            .then(data => dispatch({ type: "dataRecieved", payload: data })).catch(err => dispatch({ type: "dataFailed" }))
    }, [])


    return <div className='app'>
        <Header />
        <Main>
            {status === "loading" && <Loading />}
            {status === "error" && <Error />}
            {status === "ready" && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
            {status === "active" && <>
                <Progress index={index} numQuestions={numQuestions} points={points}
                    maxPossiblePoints={maxPossiblePoints} answer={answer} />
                <Question question={questions[index]} answer={answer} dispatch={dispatch} />
                <Footer>
                    <Timer dispatch={dispatch} seconds={seconds} />
                    <NextButton dispatch={dispatch} answer={answer} index={index} numQuestion={numQuestions} />
                </Footer>
            </>
            }
            {status === "finished" && <FinishScreen points={points} dispatch={dispatch} maxPossiblePoints={maxPossiblePoints} highScore={highScore} />}
        </Main>
    </div>
}


export default App;