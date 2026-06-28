function EmptyState({ message }) {
  return (
    <section className="status-block shell center-screen">
      <div className="empty-icon">🙂</div>
      <p>{message}</p>
    </section>
  );
}

export default EmptyState;
