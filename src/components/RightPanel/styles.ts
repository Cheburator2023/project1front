import styled from 'styled-components';

const Overlay = styled.div`
  z-index: 5;
  background-color: rgb(0 0 0 / 40%);
  position: fixed;
  overflow-y: hidden;
  display: block;
  top: 64px;
  right: 0;
  bottom: 0;
  height: calc(100vh - 64px);
  width: 100%;
`;

const Panel = styled.div`
  z-index: 1;
  float: right;
  background-color: #fff;
  justify-content: space-between;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 368px;
`;

const Header = styled.div`
  width: 100%;
  padding: 16px 12px 16px 24px;
  background-color: #edf5ff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: space-between;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`;

const Body = styled.div`
  display: flex;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  flex-direction: column;
`;

const Footer = styled.div`
  height: 80px;
  display: flex;
  border-top: 1px solid #eee;
  flex-direction: column;
  padding: 11px 24px;
  justify-content: center;
  position: sticky;
`;

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

export { Overlay, Panel, Header, HeaderRow, Body, Footer, StatusWrapper };
