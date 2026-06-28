import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="status-block shell center-screen">
          <h2>Oops</h2>
          <p>Something went wrong.</p>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
