import React from "react";
import DNALoader from "../DNALoader";
import BounceLoader from "../BounceLoader";
import "./style.css";

export default class Loading extends React.Component {
  state = {
    longerThan200MS: false
  };

  componentDidMount() {
    this.timeoutId = setTimeout(() => {
      this.setState({
        longerThan200MS: true
      });
    }, 200);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  render() {
    const {
      loading,
      style: userStyle,
      className,
      children,
      bounce = false,
      inDialog
    } = this.props;
    const { longerThan200MS } = this.state;
    const style = {
      ...userStyle,
      ...(inDialog && { minHeight: 120 })
    };
    const LoaderComp = bounce ? BounceLoader : DNALoader;

    if (loading || !children) {
      if (!longerThan200MS && !bounce) {
        return <div className={"tg-flex justify-center align-center"} />;
      }
      return (
        <div
          className={"tg-loader-container tg-flex justify-center align-center"}
        >
          <LoaderComp style={style} className={className} />
        </div>
      );
    } else {
      return children || null;
    }
  }
}
