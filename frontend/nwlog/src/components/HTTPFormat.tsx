import './css/HTTPFormat.css'; // Import the CSS file

export function HTTPFormat(payload: string) {
  const parsePayload = (payload: string) => {
    const lines = payload.split('\r\n');
    const headers: { [key: string]: string } = {};
    let requestLine = '';

    if (lines.length > 0) {
      requestLine = lines[0];
      lines.shift();
    }

    for (const line of lines) {
      if (line.trim() === '') continue;
      const [key, value] = line.split(': ');
      if (key && value) {
        headers[key] = value;
      }
    }

    return (
      <table className="http-table">
        <tbody>
{/*           <tr>
            <td>Request Line</td>
            <td>{requestLine}</td>
          </tr> */}
          {Object.entries(headers).map(([key, value], index) => (
            <tr key={index}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return <>{parsePayload(payload)}</>;
}