/* eslint-disable */
import ReactDOM from 'react-dom/client';
import React from 'react';
import './styles.css';
import Overview from './components/Overview/index.jsx';
import QuestionsAndAnswers from './components/QuestionsAndAnswers/index.jsx';
import RatingAndReviews from './components/RatingAndReviews/index.jsx';
import RelatedProducts from './components/RelatedProducts/index.jsx';
import useServerFetch from './hooks/useServerFetch.js'; //eslint-disable-line
import useReviewRating from './hooks/ReviewStars/useReviewsRating.js';

function App() {
  const [productId, setProductId] = React.useState('');
  const [styleId, setStyleId] = React.useState('');
  const [productInfo, setProductInfo] = React.useState();
  const [productStyles, setProductStyles] = React.useState();
  const initialProductFetcher = new AbortController();
  const productFetchController = new AbortController();
  const stylesFetchController = new AbortController();
  const {
    productReview,
    status: reviewsStatus,
    error: reviewsError,
  } = useReviewRating(productId);

  React.useEffect(() => {
    useServerFetch('get', `products`, {}, initialProductFetcher)
      .then((res) => {
        setProductId(res.data[0].id);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      initialProductFetcher.abort();
    };
  }, []);

  React.useEffect(() => {
    if (productId) {
      useServerFetch('get', `products/${productId}`, {}, productFetchController)
        .then((res) => {
          setProductInfo(res.data);
        })
        .catch(() => {
          setProductInfo(null);
        });
      useServerFetch(
        'get',
        `products/${productId}/styles`,
        {},
        stylesFetchController
      )
        .then((res) => {
          setProductStyles(res.data);
          setStyleId(res.data.results[0].style_id);
        })
        .catch(() => {
          setStyleId(null);
        });
    }

    return () => {
      stylesFetchController.abort();
      productFetchController.abort();
    };
  }, [productId]);

  return (
    <div style={{ padding: 12 }}>
      <h1 className="heading"> {productId} </h1>
      <div className="content">
        <Overview
          productId={productId}
          styleId={styleId}
          setStyleId={setStyleId}
          productInfo={productInfo}
          productReview={productReview}
        />
        <QuestionsAndAnswers productId={productId} />
        <RatingAndReviews
          productId={productId}
          productReview={productReview}
          status={reviewsStatus}
          error={reviewsError}
          productName={productInfo?.name}
        />
        <RelatedProducts
          productId={productId}
          setProductId={setProductId}
          styleId={styleId}
          productReview={productReview}
          productInfo={productInfo}
          productStyles={productStyles}
        />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
