import Option from "./Option";
function Question({ question, dispatch, answer }) {
    return (
        <div>
            <h4>{question.question}</h4>
            <div>

                <Option question={question} answer={answer} dispatch={dispatch} />
            </div>
        </div>
    )
}

export default Question;
