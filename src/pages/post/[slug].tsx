import { GetStaticPaths, GetStaticProps } from 'next';
import { Head } from 'next/document';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FaRegClock } from 'react-icons/fa'
import { RiCalendarLine } from 'react-icons/ri';
import { MdPersonOutline } from 'react-icons/md';
import { parse } from 'path';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function PostPage({ post }: PostProps) {

  const sizeWord = (post.data.content?.body.text).length

  const timeToRead = ((((sizeWord / 10) * 60) / 200) / 60).toFixed();

  return (
    <>
      <main className={styles.container}>
        <header>
          <Header />
        </header>
        <div className={styles.postBody}>
          <img src={post.data.banner.url}
            alt="banner" />
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time> <RiCalendarLine className={styles.logoTipo} /> {post.first_publication_date} </time>
            <span> <MdPersonOutline className={styles.logoTipo} /> {post.data.author}</span>
            <span> <FaRegClock className={styles.logoTipo} /> {timeToRead} min</span>
          </div>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.data.content.body?.text }} />
        </div>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const postId = await prismic.getByUID('post', String(slug));

  const content = postId.data.content[0]

  const post = {
    uid: postId.uid,
    first_publication_date: format(
      new Date(postId.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: postId.data.title,
      banner: {
        url: postId.data.banner.url
      },
      author: postId.data.author,
      content: {
        heading: postId.data.content[0].heading,
        body: {
          text: RichText.asHtml(postId.data.content[0].body)
        }
      }

    },
  }

  return {
    props: {
      post
    }
  }
};
