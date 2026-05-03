const Heatmap = ({ data }: any) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "320px" }}>
      {Object.entries(data).map(([date, count]: any) => (
        <div
          key={date}
          title={`${date}: ${count}`}
          style={{
            width: "20px",
            height: "20px",
            margin: "2px",
            backgroundColor: `rgba(0, 200, 0, ${count / 10})`,
          }}
        />
      ))}
    </div>
  );
};

export default Heatmap;