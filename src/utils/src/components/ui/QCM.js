export default function QCM({ question }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="card">
      <h4>{question.question}</h4>

      {question.choices.map((c, i) => (
        <div key={i}>
          <input
            type="radio"
            name={question._id}
            onChange={() => setSelected(i)}
          />
          {c}
        </div>
      ))}
    </div>
  );
}